import os, json
from pathlib import Path
from slugify import slugify
import psycopg
from dotenv import load_dotenv

# --- Load .env file (must be in the same dir or project root) ---
load_dotenv()

# --- Config from environment ---
JSON_PATH = "./products.json"  # adjust path if needed
PG_DSN    = os.getenv("PG_DSN", "postgresql://user:pass@host:5432/dbname")
SELLER_ID = os.getenv("SELLER_ID")

if not SELLER_ID:
    raise RuntimeError("SELLER_ID must be set in your .env file or environment")

def dollars_to_cents(v):
    return int(round(float(v) * 100))

def fetch_existing_slugs(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT slug FROM public.products")
        return {r[0] for r in cur.fetchall()}

def unique_slug(name, used):
    base = slugify(name, lowercase=True, max_length=120) or "item"
    s = base
    i = 2
    while s in used:
        s = f"{base}-{i}"
        i += 1
    used.add(s)
    return s

def upsert_products(conn, products_json, seller_id):
    used_slugs = fetch_existing_slugs(conn)
    rows = []
    for p in products_json:
        title = (p.get("name") or "").strip()
        if not title or p.get("price") is None:
            continue
        desc        = p.get("description") or None
        price_cents = dollars_to_cents(p["price"])
        is_active   = bool(p.get("isAvailable", True))
        stock_qty   = 1 if is_active else 0
        currency    = "USD"
        ext_code    = p.get("id")
        slug        = unique_slug(title, used_slugs)

        rows.append((seller_id, title, slug, desc, price_cents, currency, stock_qty, is_active, ext_code))

    if not rows:
        return 0

    with conn.cursor() as cur:
        cur.executemany("""
            INSERT INTO public.products
              (seller_id, title, slug, description, price_cents, currency, stock_qty, is_active, external_code)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (slug) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              price_cents = EXCLUDED.price_cents,
              currency = EXCLUDED.currency,
              stock_qty = EXCLUDED.stock_qty,
              is_active = EXCLUDED.is_active,
              updated_at = now();
        """, rows)

        cur.executemany("""
            UPDATE public.products p
            SET external_code = %s
            WHERE p.slug = %s
              AND (p.external_code IS DISTINCT FROM %s);
        """, [(r[8], r[2], r[8]) for r in rows])

    return len(rows)

def replace_product_images(conn, products_json):
    with conn.cursor() as cur:
        for p in products_json:
            ext_code = p.get("id")
            if not ext_code:
                continue
            imgs = []
            if p.get("imageUrl"):
                imgs.append(p["imageUrl"])
            if p.get("imageUrls"):
                for u in p["imageUrls"]:
                    if u and u not in imgs:
                        imgs.append(u)
            # delete existing
            cur.execute("""
                WITH tgt AS (SELECT id FROM public.products WHERE external_code = %s)
                DELETE FROM public.product_images pi
                USING tgt WHERE pi.product_id = tgt.id
            """, (ext_code,))
            for pos, url in enumerate(imgs, start=1):
                cur.execute("""
                    INSERT INTO public.product_images (product_id, url, position)
                    SELECT id, %s, %s FROM public.products WHERE external_code = %s
                """, (url, pos, ext_code))

def upsert_collections(conn, collections_json):
    with conn.cursor() as cur:
        for c in collections_json:
            cur.execute("""
                INSERT INTO public.collections (name, story, image_path, is_featured)
                VALUES (%s,%s,%s,%s)
                ON CONFLICT (name) DO UPDATE SET
                  story = EXCLUDED.story,
                  image_path = EXCLUDED.image_path,
                  is_featured = EXCLUDED.is_featured,
                  updated_at = now()
                RETURNING id
            """, (c.get("name"), c.get("story"), c.get("imagePath"), bool(c.get("isFeatured", False))))
            collection_id = cur.fetchone()[0]

            prod_ids = c.get("productIds", []) or []
            rec_ids  = c.get("recommendedProductIds", []) or []

            cur.execute("DELETE FROM public.collection_products WHERE collection_id = %s", (collection_id,))
            if prod_ids:
                cur.execute("""
                    INSERT INTO public.collection_products (collection_id, product_id, position)
                    SELECT %s, p.id, v.pos
                    FROM unnest(%s::text[]) WITH ORDINALITY AS v(ext_code, pos)
                    JOIN public.products p ON p.external_code = v.ext_code
                """, (collection_id, prod_ids))

            cur.execute("DELETE FROM public.collection_recommendations WHERE collection_id = %s", (collection_id,))
            if rec_ids:
                cur.execute("""
                    INSERT INTO public.collection_recommendations (collection_id, product_id, position)
                    SELECT %s, p.id, v.pos
                    FROM unnest(%s::text[]) WITH ORDINALITY AS v(ext_code, pos)
                    JOIN public.products p ON p.external_code = v.ext_code
                """, (collection_id, rec_ids))

def main():
    data = json.loads(Path(JSON_PATH).read_text(encoding="utf-8"))
    products_json    = data.get("products", [])
    collections_json = data.get("collections", [])

    with psycopg.connect(PG_DSN, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM public.users WHERE id = %s", (SELLER_ID,))
            if cur.fetchone() is None:
                raise RuntimeError("SELLER_ID not found in public.users(id).")

        added = upsert_products(conn, products_json, SELLER_ID)
        replace_product_images(conn, products_json)
        if collections_json:
            upsert_collections(conn, collections_json)

        conn.commit()
        print(f"Imported/updated {added} products, images & collections synced.")

if __name__ == "__main__":
    main()
