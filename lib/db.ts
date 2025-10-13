// lib/db.ts
import { neon } from '@neondatabase/serverless';

// ---- Connection ----
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const sql = neon(DATABASE_URL);

// Typed wrapper so we can do q<RowType>`...`
export const q = sql as unknown as <T>(
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<T[]>;

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
  typeof v === 'boolean'
    ? v
    : v === 't' || v === 'true' || v === 1 || v === '1';

// ===== Roles (adjust if you don't have a user_role enum) =====
export async function getUserRoles(): Promise<string[]> {
  try {
    const rows = await q<{ value: string }>`
      SELECT unnest(enum_range(NULL::user_role)) AS value
    `;
    return rows.map(r => r.value);
  } catch {
    const rows = await q<{ role: string }>`
      SELECT DISTINCT role FROM public.users WHERE role IS NOT NULL
    `;
    return rows.map(r => r.role);
  }
}

// ===== Product types & mappers =====
export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  isFeatured: boolean;
  primary_image: string | null;
};

type ProductCardRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number | string;
  currency: string;
  is_active: boolean | string | number;
  isFeatured: boolean | string;
  primary_image: string | null;
};

const toProductCard = (r: ProductCardRow): ProductCard => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  price_cents: asNum(r.price_cents),
  currency: r.currency,
  is_active: asBool(r.is_active),
  isFeatured: asBool(r.isFeatured),
  primary_image: r.primary_image ?? null,
});

// ===== Queries =====
export async function fetchProductCards(
  limit = 24,
  offset = 0
): Promise<ProductCard[]> {
  const rows = await q<ProductCardRow>`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image, is_featured AS "isFeatured"
    FROM public.v_product_card
    WHERE is_active = true
    ORDER BY title
    LIMIT ${limit} OFFSET ${offset}
  `;
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
  // primary_image also present via join
};

export async function fetchProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const productRows = await q<ProductDetailRow>`
    SELECT p.id, p.slug, p.title, p.description, p.price_cents, p.currency,
           p.stock_qty, p.is_active, v.primary_image
    FROM public.products p
    LEFT JOIN public.v_product_primary_image v ON v.product_id = p.id
    WHERE p.slug = ${slug}
    LIMIT 1
  `;
  const pr = productRows[0];
  if (!pr) return null;

  const [images, recosRows] = await Promise.all([
    q<ProductImage>`
      SELECT url, position
      FROM public.product_images
      WHERE product_id = ${pr.id}
      ORDER BY position NULLS LAST, url
    `,
    q<ProductCardRow>`
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
    `,
  ]);

  return {
    id: pr.id,
    slug: pr.slug,
    title: pr.title,
    description: pr.description,
    price_cents: asNum(pr.price_cents),
    currency: pr.currency,
    is_active: asBool(pr.is_active),
    isFeatured: asBool(pr.isFeatured),
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

// lib/db.ts
export async function fetchCollectionByName(name: string): Promise<CollectionDetail | null> {
  const colRows = await q<CollectionRow>`
    SELECT id, name, story, image_path, is_featured
    FROM public.collections
    WHERE name = ${name}
    LIMIT 1
  `;
  const col = colRows[0];
  if (!col) return null;

  const [items, recos] = await Promise.all([
    q<ProductCardWithPosRow>`
      SELECT
        pc.id, pc.slug, pc.title, pc.price_cents, pc.currency,
        pc.primary_image, vci.position, pc.is_active
      FROM public.v_collection_items vci
      JOIN public.v_product_card pc ON pc.id = vci.product_id
      WHERE vci.collection_id = ${col.id}
      ORDER BY vci.position NULLS LAST, pc.title
    `,
    q<ProductCardWithPosRow>`
      SELECT
        pc.id, pc.slug, pc.title, pc.price_cents, pc.currency,
        pc.primary_image, vcr.position, pc.is_active
      FROM public.v_collection_recos vcr
      JOIN public.v_product_card pc ON pc.id = vcr.product_id
      WHERE vcr.collection_id = ${col.id}
      ORDER BY vcr.position NULLS LAST, pc.title
    `,
  ]);

  return {
    ...col,
    is_featured: asBool(col.is_featured),
    items: items.map(toProductCardWithPos),
    recommendations: recos.map(toProductCardWithPos),
  };
}

// ----- Search -----
export async function searchProducts(qs: string, limit = 20): Promise<ProductCard[]> {
  const rows = await q<ProductCardRow>`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image
    FROM public.v_product_card
    WHERE is_active = true
      AND (title ILIKE ${'%' + qs + '%'} OR ${qs} = '')
    ORDER BY title
    LIMIT ${limit}
  `;
  return rows.map(toProductCard);
}

// ----- Seller products -----
const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export async function fetchSellerProducts(
  sellerId?: string,
  limit = 50,
  offset = 0
): Promise<ProductCard[]> {
  if (!sellerId || !isUUID(sellerId)) {
    // Fallback: no filter (or choose the first seller_id found, if you prefer)
    const rows = await q<ProductCardRow>`
      SELECT id, slug, title, price_cents, currency, is_active, primary_image
      FROM public.v_product_card
      WHERE is_active = true
      ORDER BY title
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(toProductCard);
  }

  const rows = await q<ProductCardRow>`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image
    FROM public.v_product_card
    WHERE is_active = true
      AND id IN (SELECT id FROM public.products WHERE seller_id = ${sellerId}::uuid)
    ORDER BY title
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows.map(toProductCard);
}


export type CollectionSummary = {
  id: string;
  name: string;
  story: string | null;
  image_path: string | null;
  is_featured: boolean;
  item_count: number;
  hero_image: string | null;
};

type CollectionSummaryRow = {
  id: string;
  name: string;
  story: string | null;
  image_path: string | null;
  is_featured: boolean | string | number;
  item_count: number | string;
  hero_image: string | null;
};

export async function fetchCollectionsSummary(): Promise<CollectionSummary[]> {
  const rows = await q<CollectionSummaryRow>`
    WITH hero AS (
      SELECT
        c.id AS collection_id,
        /* prefer collection's own image_path, else first product's primary image */
        COALESCE(
          c.image_path,
          (
            SELECT v.primary_image
            FROM public.collection_products cp2
            JOIN public.v_product_primary_image v ON v.product_id = cp2.product_id
            WHERE cp2.collection_id = c.id
            ORDER BY cp2.position NULLS LAST, v.primary_image
            LIMIT 1
          )
        ) AS hero_image
      FROM public.collections c
    )
    SELECT
      c.id::text AS id,
      c.name,
      c.story,
      c.image_path,
      c.is_featured,
      COUNT(cp.product_id) AS item_count,
      h.hero_image
    FROM public.collections c
    LEFT JOIN public.collection_products cp ON cp.collection_id = c.id
    LEFT JOIN hero h ON h.collection_id = c.id
    GROUP BY c.id, c.name, c.story, c.image_path, c.is_featured, h.hero_image
    ORDER BY c.name;
  `;

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    story: r.story,
    image_path: r.image_path,
    is_featured: asBool(r.is_featured),
    item_count: asNum(r.item_count),
    hero_image: r.hero_image,
  }));
}

