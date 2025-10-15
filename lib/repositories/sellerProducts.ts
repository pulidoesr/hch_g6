// lib/repositories/sellerProducts.ts
import { q } from "@/lib/db";

export type SellerProductInput = {
  title: string;
  description?: string | null;
  price_cents: number;
  currency: string;       
  slug: string;           
  primary_image?: string | null;
};

export async function createSellerProduct(sellerId: string, data: SellerProductInput) {
  const rows = await q<{ id: string }>`
    INSERT INTO products (seller_id, title, description, price_cents, currency, slug, primary_image)
    VALUES (${sellerId}::uuid, ${data.title}, ${data.description ?? null},
            ${data.price_cents}, ${data.currency}, ${data.slug}, ${data.primary_image ?? null})
    RETURNING id::text AS id;
  `;
  return rows[0];
}

export async function updateSellerProduct(
  sellerId: string,
  productId: string,
  data: Partial<SellerProductInput>
) {
  // Only update if product belongs to this seller
  const rows = await q<{ id: string }>`
    UPDATE products p
      SET title = COALESCE(${data.title}, p.title),
          description = COALESCE(${data.description ?? null}, p.description),
          price_cents = COALESCE(${data.price_cents ?? null}, p.price_cents),
          currency = COALESCE(${data.currency ?? null}, p.currency),
          slug = COALESCE(${data.slug ?? null}, p.slug),
          primary_image = COALESCE(${data.primary_image ?? null}, p.primary_image)
    WHERE p.id = ${productId}::uuid
      AND p.seller_id = ${sellerId}::uuid
    RETURNING p.id::text AS id;
  `;
  return rows[0] ?? null; 
}

export async function deleteSellerProduct(sellerId: string, productId: string) {
  const rows = await q<{ id: string }>`
    DELETE FROM products p
    WHERE p.id = ${productId}::uuid
      AND p.seller_id = ${sellerId}::uuid
    RETURNING p.id::text AS id;
  `;
  return rows[0] ?? null;
}
