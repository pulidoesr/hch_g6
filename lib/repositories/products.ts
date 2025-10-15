// lib/repositories/products.ts
import { q } from "@/lib/db";
import type { Product, Review } from "@/lib/types/product";

/* ---------- utils ---------- */
const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/* ---------- Types used by pages/components ---------- */
export type DbProductCard = {
  id: string;
  image_url: string | null;
  description: string | null;
  title: string | null;
  price_cents: number | null;
  priority: number;
};

/* ---------- HOME: 10 cards, featured collections first ---------- */
export async function getHomeFeaturedProducts(limit = 10) {
  const rows = await q<DbProductCard>`
    WITH base AS (
      SELECT
        p.id,
        p.title,
        p.description,
        p.price_cents,
        MIN(CASE WHEN c.is_featured THEN 1 ELSE 2 END)
          FILTER (WHERE c.id IS NOT NULL) AS prio_in_collections
      FROM products p
      LEFT JOIN collection_products cp ON cp.product_id = p.id
      LEFT JOIN collections c ON c.id = cp.collection_id
      GROUP BY p.id, p.title, p.description, p.price_cents
    ),
    ranked AS (
      SELECT
        b.id,
        b.title,
        b.description,
        b.price_cents,
        COALESCE(b.prio_in_collections, 3) AS priority
      FROM base b
    )
    SELECT
      r.id::text AS id,
      r.title,
      r.description,
      r.price_cents,
      vpi.primary_image AS image_url,
      r.priority
    FROM ranked r
    LEFT JOIN v_product_primary_image vpi ON vpi.product_id = r.id
    ORDER BY r.priority ASC, r.id
    LIMIT ${limit};
  `;

  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url ?? "",
    description: r.description ?? r.title ?? "",
    price: Math.round(r.price_cents ?? 0) / 100,
    isFeatured: r.priority === 1,
  }));
}

/* ---------- SIMPLE PRODUCT (by id) ---------- */
export async function getProductById(id: string) {
  const rows = await q<{
    id: string;
    title: string | null;
    description: string | null;
    price_cents: number | null;
    image_url: string | null;
  }>`
    SELECT
      p.id::text AS id,
      p.title,
      p.description,
      p.price_cents,
      vpi.primary_image AS image_url
    FROM products p
    LEFT JOIN v_product_primary_image vpi ON vpi.product_id = p.id
    WHERE p.id = ${id}::uuid
    LIMIT 1;
  `;

  const p = rows[0];
  if (!p) return null;

  return {
    id: p.id,
    imageUrl: p.image_url ?? "",
    description: p.description ?? p.title ?? "",
    price: Math.round(p.price_cents ?? 0) / 100,
    isFeatured: false,
  };
}

/* ---------- PRODUCT DETAIL WITH GALLERY + REVIEWS (UUID OR SLUG) ---------- */
export async function getProductByIdWithDetails(idOrSlug: string): Promise<Product | null> {
  type Row = {
    id: string;
    name: string | null;
    title: string | null;
    description: string | null;
    slug: string | null;
    price_cents: number | null;
    currency: string | null;
    primary_url: string | null;
    image_urls: string[] | null;
    avg_rating: number | null;
  };

  const byId = isUUID(idOrSlug);

  const rows = byId
    ? await q<Row>`
        WITH gallery AS (
          SELECT pi.product_id,
                 ARRAY_AGG(pi.url ORDER BY COALESCE(pi.position, pi.sort_order, 999999), pi.created_at) AS image_urls
          FROM product_images pi
          GROUP BY pi.product_id
        ),
        rated AS (
          SELECT r.product_id, AVG(r.rating)::float AS avg_rating
          FROM reviews r
          GROUP BY r.product_id
        )
        SELECT
          p.id::text AS id,
          p.title     AS name,
          p.title,
          p.description,
          p.slug,
          p.price_cents,
          p.currency,
          vpi.primary_image AS primary_url,
          g.image_urls,
          COALESCE(rt.avg_rating, 0) AS avg_rating
        FROM products p
        LEFT JOIN v_product_primary_image vpi ON vpi.product_id = p.id
        LEFT JOIN gallery g ON g.product_id = p.id
        LEFT JOIN rated   rt ON rt.product_id = p.id
        WHERE p.id = ${idOrSlug}::uuid
        LIMIT 1;
      `
    : await q<Row>`
        WITH gallery AS (
          SELECT pi.product_id,
                 ARRAY_AGG(pi.url ORDER BY COALESCE(pi.position, pi.sort_order, 999999), pi.created_at) AS image_urls
          FROM product_images pi
          GROUP BY pi.product_id
        ),
        rated AS (
          SELECT r.product_id, AVG(r.rating)::float AS avg_rating
          FROM reviews r
          GROUP BY r.product_id
        )
        SELECT
          p.id::text AS id,
          p.title     AS name,
          p.title,
          p.description,
          p.slug,
          p.price_cents,
          p.currency,
          vpi.primary_image AS primary_url,
          g.image_urls,
          COALESCE(rt.avg_rating, 0) AS avg_rating
        FROM products p
        LEFT JOIN v_product_primary_image vpi ON vpi.product_id = p.id
        LEFT JOIN gallery g ON g.product_id = p.id
        LEFT JOIN rated   rt ON rt.product_id = p.id
        WHERE p.slug = ${idOrSlug}
        LIMIT 1;
      `;

  const row = rows[0];
  if (!row) return null;

  const reviewsRows = await q<{
    customer_name: string | null;
    customer_image_url: string | null;
    rating: number;
    created_at: string;
    comment: string;
  }>`
    SELECT
      COALESCE(r.customer_name, u.name, 'Anonymous') AS customer_name,
      COALESCE(r.customer_image_url, u.image, '')    AS customer_image_url,
      r.rating,
      r.created_at,
      COALESCE(NULLIF(r.body, ''), NULLIF(r.title, ''), '') AS comment
    FROM public.reviews r
    LEFT JOIN public.users u ON u.id = r.user_id
    WHERE r.product_id = ${row.id}::uuid
    ORDER BY r.created_at DESC
    LIMIT 20;
  `;

  const gallery = row.image_urls ?? [];
  const primary = row.primary_url ?? gallery[0] ?? "";
  const priceCents = row.price_cents ?? 0;

  return {
    id: row.id,
    name: row.name ?? row.title ?? "",
    description: row.description ?? "",
    imageUrl: primary,
    imageUrls: gallery,
    price: Math.round(priceCents) / 100,
    rating: row.avg_rating ?? 0,
    reviews: reviewsRows.map(r => ({
      customerName: r.customer_name ?? "Anonymous",
      customerImage: r.customer_image_url ?? "",
      rating: r.rating,
      date: new Date(r.created_at).toISOString().slice(0, 10),
      comment: r.comment,
    })),
  };
}

/* ---------- SIMILAR (same collections, top rated) ---------- */
// lib/repositories/products.ts
export async function getTopRatedSimilarProducts(idOrSlug: string, limit = 6): Promise<Product[]> {
  let productUuid = idOrSlug;
  if (!isUUID(idOrSlug)) {
    const idRows = await q<{ id: string }>`
      SELECT id::text AS id FROM products WHERE slug = ${idOrSlug} LIMIT 1;
    `;
    if (!idRows[0]) return [];
    productUuid = idRows[0].id;
  }

  const rows = await q<{
    id: string;
    name: string | null;
    title: string | null;
    description: string | null;
    price_cents: number | null;
    rating: number | null;
    primary_url: string | null;
    image_urls: string[] | null;
  }>`
    WITH target AS (
      SELECT DISTINCT cp.collection_id
      FROM collection_products cp
      WHERE cp.product_id = ${productUuid}::uuid
    ),
    candidates AS (
      SELECT p.id, p.title, p.description, p.price_cents
      FROM collection_products cp
      JOIN target t ON t.collection_id = cp.collection_id
      JOIN products p ON p.id = cp.product_id
      WHERE p.id <> ${productUuid}::uuid
    ),
    rated AS (
      SELECT
        c.id,
        c.title,
        c.description,
        c.price_cents,
        COALESCE(AVG(r.rating)::float, 0) AS rating
      FROM candidates c
      LEFT JOIN reviews r ON r.product_id = c.id
      GROUP BY c.id, c.title, c.description, c.price_cents
    ),
    gallery AS (
      SELECT
        pi.product_id,
        ARRAY_AGG(
          pi.url
          ORDER BY COALESCE(pi.position, pi.sort_order, 999999), pi.created_at
        ) AS image_urls
      FROM product_images pi
      GROUP BY pi.product_id
    )
    SELECT
      r.id::text AS id,
      r.title    AS name,
      r.description,
      r.price_cents,
      r.rating,
      vpi.primary_image AS primary_url,
      g.image_urls
    FROM rated r
    LEFT JOIN v_product_primary_image vpi ON vpi.product_id = r.id
    LEFT JOIN gallery g ON g.product_id = r.id
    ORDER BY r.rating DESC, r.id
    LIMIT ${limit};
  `;

  return rows.map(row => {
    const gallery = row.image_urls ?? [];
    const primary = row.primary_url ?? gallery[0] ?? "";
    return {
      id: row.id,
      name: row.name ?? row.title ?? "",
      description: row.description ?? "",
      imageUrl: primary,
      imageUrls: gallery,
      price: Math.round(row.price_cents ?? 0) / 100,
      rating: row.rating ?? 0,
      reviews: [],
    };
  });
}

/* ---------- PRODUCTS BY CATEGORY ID ---------- */
// lib/repositories/products.ts
export async function getProductsByCategoryId(categoryId: string) {
  if (!isUUID(categoryId)) return [];

  // Change table names/joins to match your schema: collection_products vs product_categories
  return q<{
    id: string; title: string|null; description: string|null;
    price_cents: number|null; currency: string|null; slug: string|null;
    primary_image: string|null;
  }>`
    SELECT p.id::text, p.title, p.description, p.price_cents, p.currency, p.slug,
           v.primary_image
    FROM product_categories pc
    JOIN products p ON p.id = pc.product_id
    LEFT JOIN v_product_primary_image v ON v.product_id = p.id
    WHERE pc.category_id = ${categoryId}::uuid
    ORDER BY p.created_at DESC
    LIMIT 48;
  `;
}