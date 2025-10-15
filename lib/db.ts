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
  // NOTE: we often store seller_id here in the DB; not needed in this module type
};

export function firstRow<T>(rows: unknown[]): T | null {
  return (rows as T[])[0] ?? null;
}

const asNum = (v: unknown) => (typeof v === 'number' ? v : Number(v));
const asBool = (v: unknown) =>
  typeof v === 'boolean'
    ? v
    : v === 't' || v === 'true' || v === 1 || v === '1';

// ===== Roles =====
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
  isNew:boolean;
  isBestSeller:boolean;
  isOnSale:boolean;
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
  isNew: boolean | string;
  isBestSeller: boolean | string;
  isOnSale: boolean | string;
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
  isBestSeller: asBool(r.isBestSeller),
  isOnSale: asBool(r.isOnSale),
  isNew: asBool(r.isNew),
  primary_image: r.primary_image ?? null,
});

// ===== Queries =====
export async function fetchProductCards(
  limit = 24,
  offset = 0
): Promise<ProductCard[]> {
  const rows = await q<ProductCardRow>`
    SELECT id, slug, title, price_cents, currency, is_active, primary_image, is_featured AS "isFeatured", isnew AS "isNew", isbestseller AS "isBestSeller", isonsale AS "isOnSale" 
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
};

export async function fetchProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const productRows = await q<ProductDetailRow>`
    SELECT
      p.id, p.slug, p.title, p.description, p.price_cents, p.currency,
      p.stock_qty, p.is_active,
      /* make sure we select is_featured so mapping works */
      p.is_featured AS "isFeatured",
      v.primary_image
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
      SELECT pc.id, pc.slug, pc.title, pc.price_cents, pc.currency,
             pc.is_active, pc.primary_image, pc.is_featured AS "isFeatured"
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
    isBestSeller: asBool(pr.isBestSeller),
    isNew: asBool(pr.isNew),
    isOnSale: asBool(pr.isOnSale),
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
        pc.primary_image, vci.position, pc.is_active, pc.is_featured AS "isFeatured"
      FROM public.v_collection_items vci
      JOIN public.v_product_card pc ON pc.id = vci.product_id
      WHERE vci.collection_id = ${col.id}
      ORDER BY vci.position NULLS LAST, pc.title
    `,
    q<ProductCardWithPosRow>`
      SELECT
        pc.id, pc.slug, pc.title, pc.price_cents, pc.currency,
        pc.primary_image, vcr.position, pc.is_active, pc.is_featured AS "isFeatured"
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
    SELECT id, slug, title, price_cents, currency, is_active, primary_image, is_featured AS "isFeatured"
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
    const rows = await q<ProductCardRow>`
      SELECT id, slug, title, price_cents, currency, is_active, primary_image, is_featured AS "isFeatured"
      FROM public.v_product_card
      WHERE is_active = true
      ORDER BY title
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map(toProductCard);
  }

  const rows = await q<ProductCardRow>`
    SELECT pc.id, pc.slug, pc.title, pc.price_cents, pc.currency, pc.is_active,
           pc.primary_image, pc.is_featured AS "isFeatured"
    FROM public.v_product_card pc
    JOIN public.products p ON p.id = pc.id
    WHERE pc.is_active = true
      AND p.seller_id = ${sellerId}::uuid
    ORDER BY pc.title
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows.map(toProductCard);
}

// ----- Collections summary -----
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

// ===== Seller =====
export type SellerInfo = {
  id: string;
  name: string;
  photoUrl: string | null;
  email: string | null;
  role: string | null;
};

/** Look up the seller in `public.users` (FK target of products.seller_id). */
export async function fetchSellerInfo(sellerId: string): Promise<SellerInfo | null> {
  if (!isUUID(sellerId)) return null;

  const rows = await q<{
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
    role: string | null;
  }>`
    SELECT id::text AS id, name, image, email, role
    FROM public.users
    WHERE id = ${sellerId}::uuid
    LIMIT 1
  `;

  const r = rows[0];
  if (!r) return null;

  return {
    id: r.id,
    name: r.name ?? `Seller ${sellerId}`,
    photoUrl: r.image,
    email: r.email,
    role: r.role,
  };
}

/** Convenience: fetch seller profile + their products (reuses fetchSellerProducts above). */
export async function loadSellerData(
  sellerId: string,
  limit = 50,
  offset = 0
): Promise<{ seller: SellerInfo; products: ProductCard[] }> {
  const [seller, products] = await Promise.all([
    fetchSellerInfo(sellerId),
    fetchSellerProducts(sellerId, limit, offset),
  ]);

  // Fallback when user row isn't found (keeps UI stable)
  const safeSeller: SellerInfo =
    seller ?? {
      id: sellerId,
      name: `Seller ${sellerId}`,
      photoUrl: "/default.jpg",
      email: null,
      role: null,
    };

  return { seller: safeSeller, products };
}

type CountryRow = {
  id: number;
  name: string;
};
export type Country = {
  id: number;
  name: string;
};
export async function fetchCountriesList(): Promise<Country[]> {
  const rows = await q<CountryRow>`
    -- CORREÇÃO: Seleciona tanto o ID quanto o NAME
    SELECT id, name
    FROM public.countries
    ORDER BY name;
  `;
  
  // Mapeia o resultado para devolver o array de objetos 'Country'.
  // O tipo 'rows' já é CountryRow[], então basta retornar os dados.
  return rows.map(r => ({
    id: r.id,
    name: r.name,
  } as Country));
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')   // Substitui espaços por underline
        .replace(/[^\w-]+/g, '') // Remove todos os caracteres não-palavra
        .replace(/--+/g, '_');  // Substitui múltiplos underlines por um único
}

export async function createProduct(formData: FormData) {
    // 1. EXTRAÇÃO E CONVERSÃO DOS DADOS DO FORMULÁRIO
    const sellerId = formData.get('seller_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceDollars = formData.get('price_dollars') as string;
    
    // 2. VALIDAÇÃO E CONVERSÃO
    if (!sellerId || !title || !priceDollars) {
        throw new Error('Missing required form fields: seller_id, title, and price_dollars.');
    }

    // Validação de UUID
    if (!isUUID(sellerId)) { // Reutilizando a função isUUID já definida no seu código
        throw new Error('Invalid seller_id format.');
    }

    // Geração do Slug
    const slug = slugify(title);
    
    // Conversão de preço (de string decimal para integer em centavos)
    const priceCents = Math.round(parseFloat(priceDollars) * 100);

    // 3. EXECUÇÃO DA QUERY SQL
    try {
        // CORREÇÃO AQUI: Usando 'q' para a query tipada e 'Template Literal'
        const rows = await q<{ id: string }>`
            INSERT INTO public.products 
                (seller_id, title, slug, description, price_cents, stock_qty, is_active)
            VALUES 
                (${sellerId}::uuid, ${title}, ${slug}, ${description}, ${priceCents}, 1, TRUE)
            RETURNING id;
        `;
        
        const productId = rows[0]?.id;
        if (!productId) {
             throw new Error("Insert failed, no ID returned.");
        }

        // Retorna o ID gerado
        return { success: true, productId };

    } catch (error) {
        console.error("Database insertion failed:", error);
        return { success: false, error: 'Failed to create product in database.' };
    }
}