/* scripts/import_product_reviews.ts
   Import reviews from product_review.json into public.reviews

   Usage:
     export DATABASE_URL="postgres://USER:PASS@HOST:PORT/DB"
     npx ts-node scripts/import_product_reviews.ts
*/
import 'dotenv/config';
import fs from "fs";
import path from "path";
import { Pool } from "pg";

type JsonReview = {
  rating: number;
  date: string;                // "YYYY-MM-DD" (any valid Date parseable)
  comment?: string | null;
  customerName?: string | null;
  customerImage?: string | null;
};

type JsonProduct = {
  id: string;                  // may be uuid or a local code like "1a"
  name: string;                // product title
  reviews?: JsonReview[];
};

type Root = { products: JsonProduct[] };

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL env var");
  }

  // 1) Load JSON
  const jsonPath = path.resolve(".\\data\\products_review.json"); // <— adjust if needed
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data: Root = JSON.parse(raw);

  // 2) DB connect
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Build product lookup maps
  const prodRes = await pool.query<{ id: string; title: string | null; slug?: string | null }>(
    `SELECT id::text, title, NULL::text as slug FROM public.products`
  );

  const byId = new Map(prodRes.rows.map(r => [r.id, r.id]));
  const byTitle = new Map<string, string>();
  for (const r of prodRes.rows) if (r.title) byTitle.set(norm(r.title), r.id);

  let inserted = 0;
  let skippedProducts = 0;
  let skippedReviews = 0;

  // 3) Import reviews
  for (const jp of data.products) {
    if (!jp.reviews?.length) continue;

    // Try to resolve product_id
    let productId: string | undefined;
    if (isUUID(jp.id) && byId.has(jp.id)) {
      productId = jp.id;
    } else {
      productId = byTitle.get(norm(jp.name));
    }
    if (!productId) {
      skippedProducts++;
      console.warn(`No DB match for product "${jp.name}" (json id=${jp.id}). Skipping its reviews.`);
      continue;
    }

    for (const rv of jp.reviews) {
      try {
        // sanitize inputs
        const rating =
          typeof rv.rating === "number" && rv.rating >= 1 && rv.rating <= 5 ? rv.rating : 5;
        const createdAt = rv.date ? new Date(rv.date).toISOString() : new Date().toISOString();
        const body = (rv.comment ?? "").trim();
        const customerName = rv.customerName ?? null;
        const customerImage = rv.customerImage ?? null;

        // Use INSERT ... ON CONFLICT to avoid duplicates if you re-run the script
        await pool.query(
          `
          INSERT INTO public.reviews
            (product_id, user_id, rating, title, body, created_at, customer_name, customer_image_url)
          VALUES ($1, NULL, $2, NULL, $3, $4::timestamptz, $5, $6)
          ON CONFLICT ON CONSTRAINT uq_reviews_dedupe DO NOTHING
          `,
          [productId, rating, body, createdAt, customerName, customerImage]
        );

        inserted++;
      } catch (e) {
        skippedReviews++;
        console.error(`Failed to insert review for product_id=${productId}:`, e);
      }
    }
  }

  await pool.end();
  console.log(
    `Import complete. Inserted=${inserted}, SkippedProducts(No match)=${skippedProducts}, SkippedReviews(Errors)=${skippedReviews}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
