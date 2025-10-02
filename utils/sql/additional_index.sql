CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_collection_products_colpos ON public.collection_products(collection_id, position);
CREATE INDEX IF NOT EXISTS idx_collection_recos_colpos ON public.collection_recommendations(collection_id, position);
