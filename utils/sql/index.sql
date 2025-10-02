-- Primary product image (lowest position number wins)
CREATE OR REPLACE VIEW public.v_product_primary_image AS
SELECT pi.product_id, MIN(pi.position) AS first_pos,
       (ARRAY_AGG(pi.url ORDER BY pi.position))[1] AS primary_image
FROM public.product_images pi
GROUP BY pi.product_id;

-- Product card: one row per product with primary image
CREATE OR REPLACE VIEW public.v_product_card AS
SELECT p.id, p.slug, p.title, p.price_cents, p.currency, p.is_active,
       v.primary_image
FROM public.products p
LEFT JOIN public.v_product_primary_image v ON v.product_id = p.id;

-- Collection items (ordered)
CREATE OR REPLACE VIEW public.v_collection_items AS
SELECT c.id AS collection_id, c.name AS collection_name,
       p.id AS product_id, p.slug, p.title, p.price_cents, p.currency,
       v.primary_image, cp.position
FROM public.collections c
JOIN public.collection_products cp ON cp.collection_id = c.id
JOIN public.products p ON p.id = cp.product_id
LEFT JOIN public.v_product_primary_image v ON v.product_id = p.id;

-- Collection recommendations (ordered)
CREATE OR REPLACE VIEW public.v_collection_recos AS
SELECT c.id AS collection_id, p.id AS product_id, p.slug, p.title,
       p.price_cents, p.currency, v.primary_image, cr.position
FROM public.collections c
JOIN public.collection_recommendations cr ON cr.collection_id = c.id
JOIN public.products p ON p.id = cr.product_id
LEFT JOIN public.v_product_primary_image v ON v.product_id = p.id;
