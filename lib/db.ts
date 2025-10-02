// lib/db.ts
import { neon } from '@neondatabase/serverless';

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const sql = neon(DATABASE_URL);

// ===== Helpers & types =====
export type DbUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  password_hash: string;
};

export function firstRow<T>(rows: unknown[]): T | null {
  return (rows as T[])[0] ?? null;
}

const asNum = (v: unknown) => (typeof v === 'number' ? v : Number(v));
const asBool = (v: unknown) =>
  typeof v === 'boolean' ? v : v === 't' || v === 'true' || v === 1 || v === '1';

// ===== Roles (adjust if you don't have a user_role enum) =====
export async function getUserRoles(): Promise<string[]> {
  const rows = (await sql/* sql */`
    SELECT unnest(enum_range(NULL::user_role)) AS value
  `) as Array<{ value: string }>;
  return rows.map(r => r.value);
}

// ===== Product types & mappers =====
export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  primary_image: string | null;
};

type ProductCardRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number | string;
  currency: string;
  is_active: boolean | string | number;
  primary_image: string | null;
};

const toProductCard = (r: ProductCardRow): ProductCard => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  price_cents: asNum(r.price_cents),
  currency: r.currency,
  is_active: asBool(r.is_active),
  primary_image: r.primary_image ?? null,
});

// ===== Queries =====
export async function fetchProductCards(
  limit = 24,
  offset = 0
): Promise<ProductCard[]> {
  const rows = (await sql`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image
    FROM public.v_product_card
    WHERE is_active = true
    ORDER BY title
    LIMIT ${limit} OFFSET ${offset}
  `) as ProductCardRow[];
  return rows.map(toProductCard);
}

// ----- Product detail -----
export type ProductImage = { url: string; position: number | null };
export type ProductDetail = ProductCard & {
  description: string | null;
  stock_qty: number;
  images: ProductImage[];
  recommendations: ProductCard[];
};

type ProductDetailRow = ProductCardRow & {
  description: string | null;
  stock_qty: number | string;
};

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  const productRows = (await sql`
    SELECT p.id, p.slug, p.title, p.description, p.price_cents, p.currency,
           p.stock_qty, p.is_active, v.primary_image
    FROM public.products p
    LEFT JOIN public.v_product_primary_image v ON v.product_id = p.id
    WHERE p.slug = ${slug}
    LIMIT 1
  `) as ProductDetailRow[];
  const pr = productRows[0];
  if (!pr) return null;

  const images = (await sql`
    SELECT url, position
    FROM public.product_images
    WHERE product_id = ${pr.id}
    ORDER BY position NULLS LAST, url
  `) as ProductImage[];

  const recosRows = (await sql`
    SELECT pc.id, pc.slug, pc.title, pc.price_cents, pc.currency, pc.is_active, pc.primary_image
    FROM public.v_collection_recos r
    JOIN public.v_product_card pc ON pc.id = r.product_id
    WHERE r.product_id <> ${pr.id}
      AND r.collection_id IN (
        SELECT collection_id
        FROM public.collection_products
        WHERE product_id = ${pr.id}
      )
    ORDER BY r.position
    LIMIT 8
  `) as ProductCardRow[];

  return {
    id: pr.id,
    slug: pr.slug,
    title: pr.title,
    description: pr.description,
    price_cents: asNum(pr.price_cents),
    currency: pr.currency,
    is_active: asBool(pr.is_active),
    primary_image: pr.primary_image ?? null,
    stock_qty: asNum(pr.stock_qty),
    images,
    recommendations: recosRows.map(toProductCard),
  };
}

// ----- Collections -----
type CollectionRow = {
  id: string;
  name: string;
  story: string | null;
  image_path: string | null;
  is_featured: boolean | string | number;
};

export type ProductCardWithPos = ProductCard & { position: number | null };
export type CollectionDetail = CollectionRow & {
  is_featured: boolean;
  items: ProductCardWithPos[];
  recommendations: ProductCardWithPos[];
};

type ProductCardWithPosRow = ProductCardRow & { position: number | null };
const toProductCardWithPos = (r: ProductCardWithPosRow): ProductCardWithPos => ({
  ...toProductCard(r),
  position: r.position ?? null,
});

export async function fetchCollectionByName(name: string): Promise<CollectionDetail | null> {
  const colRows = (await sql`
    SELECT id, name, story, image_path, is_featured
    FROM public.collections
    WHERE name = ${name}
    LIMIT 1
  `) as CollectionRow[];
  const col = colRows[0];
  if (!col) return null;

  const items = (await sql`
    SELECT product_id AS id, slug, title, price_cents, currency, primary_image, position, is_active
    FROM public.v_collection_items
    WHERE collection_id = ${col.id}
    ORDER BY position, title
  `) as ProductCardWithPosRow[];

  const recos = (await sql`
    SELECT product_id AS id, slug, title, price_cents, currency, primary_image, position, is_active
    FROM public.v_collection_recos
    WHERE collection_id = ${col.id}
    ORDER BY position, title
  `) as ProductCardWithPosRow[];

  return {
    ...col,
    is_featured: asBool(col.is_featured),
    items: items.map(toProductCardWithPos),
    recommendations: recos.map(toProductCardWithPos),
  };
}

// ----- Search -----
export async function searchProducts(q: string, limit = 20): Promise<ProductCard[]> {
  const rows = (await sql`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image
    FROM public.v_product_card
    WHERE is_active = true
      AND (title ILIKE ${'%' + q + '%'} OR ${q} = '')
    ORDER BY title
    LIMIT ${limit}
  `) as ProductCardRow[];
  return rows.map(toProductCard);
}

// ----- Seller products -----
export async function fetchSellerProducts(
  sellerId: string,
  limit = 50,
  offset = 0
): Promise<ProductCard[]> {
  const rows = (await sql`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image
    FROM public.v_product_card
    WHERE is_active = true
      AND id IN (SELECT id FROM public.products WHERE seller_id = ${sellerId})
    ORDER BY title
    LIMIT ${limit} OFFSET ${offset}
  `) as ProductCardRow[];
  return rows.map(toProductCard);
}
