// app/seller/products/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { q } from "@/lib/db";
import EditForm from "./ui/EditForm";

// Next 15: params may be async, so allow MaybePromise and await it.
type Params = { id: string };
type MaybePromise<T> = T | Promise<T>;

export default async function EditProductPage({
  params,
}: {
  params: MaybePromise<Params>;
}) {
  // ✅ await params before using its properties
  const { id } = await Promise.resolve(params);

  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  // Guard: only sellers with a linked sellerId
  if (!session || role !== "seller" || !sellerId) {
    notFound();
  }

  // ✅ Derive primary image from product_images
  const rows = await q<{
    id: string;
    title: string | null;
    description: string | null;
    price_cents: number | null;
    currency: string | null;
    slug: string | null;
    image_url: string | null; // derived
  }>`
    SELECT
      p.id::text AS id,
      p.title,
      p.description,
      p.price_cents,
      p.currency,
      p.slug,
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY COALESCE(pi.position, pi.sort_order, 999999), pi.created_at
        LIMIT 1
      ) AS image_url
    FROM products p
    WHERE p.id = ${id}::uuid
      AND p.seller_id = ${sellerId}::uuid
    LIMIT 1;
  `;

  const p = rows[0];
  if (!p) notFound();

  return (
    <EditForm
      product={{
        id: p.id,
        title: p.title ?? "",
        description: p.description ?? "",
        price_cents: p.price_cents ?? 0,
        currency: p.currency ?? "USD",
        slug: p.slug ?? "",
        primary_image: p.image_url ?? "",
      }}
    />
  );
}
