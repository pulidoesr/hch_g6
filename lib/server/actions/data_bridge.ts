// lib/server/actions/data_bridge.ts
'use server';
import { q } from "@/lib/db";
import { fetchProductCards, fetchSellerProducts, type ProductCard } from '@/lib/db';
import {
  getHomeFeaturedProducts,
  getProductByIdWithDetails,
  getTopRatedSimilarProducts,

} from '@/lib/repositories/products';
import { getCollections } from '@/lib/repositories/collection';

import type {
  Product as JsonProduct,
  CategoryData,
  ShippingOption,
  Seller,
} from '@/lib/types/product-data';


// ----------------- helpers -----------------
const centsToDollars = (c?: number | null) => (c ?? 0) / 100;

// Shape that matches getHomeFeaturedProducts SQL
type HomeCardRow = {
  id: string;
  title: string;
  price_cents: number;
  primary_image: string | null;
  is_featured: boolean;
};

// NOVO: Função auxiliar para conversão de moeda
const dollarsToCents = (dollars: number) => Math.round(dollars * 100); 

function cardToJsonProduct(card: {
  id: string;
  title: string;
  price_cents: number;
  primary_image: string | null;
}): JsonProduct {
// ... (código existente)
  return {
    id: card.id,
    name: card.title || 'Untitled',
    description: '',
    price: centsToDollars(card.price_cents),
    imageUrl: card.primary_image ?? '',
    imageUrls: [],
    rating: 0,
  } as unknown as JsonProduct;
}

export interface ProductCardData {
  id: string;
  title: string;
  price_cents: number;
  primary_image: string | null;
  isFeatured?: boolean;
}

function cardToFullProduct(card: ProductCardData): JsonProduct {
// ... (código existente)
  return {
    id: card.id,
    sellerId: 0,
    name: card.title || 'Untitled',
    description: '',
    price: centsToDollars(card.price_cents),
    imageUrl: card.primary_image ?? '',
    imageUrls: [],
    isFeatured: !!card.isFeatured,
    isNew: false,
    isOnSale: false,
    isBestSeller: false,
    rating: 0,
    displayOnMarketplace: true,
  } as JsonProduct;
}

// ----------------- products -----------------
export async function getAllProducts(): Promise<JsonProduct[]> {
  const cards = await fetchProductCards(48, 0);
  
  
  return cards.map(cardToJsonProduct);
}

export async function getAllShopProducts(): Promise<JsonProduct[]> {
  const cards = await fetchProductCards(48, 0);
  return cards.map(c =>
    cardToFullProduct({
      id: c.id,
      title: c.title,
      price_cents: c.price_cents,
      primary_image: c.primary_image,
      isFeatured: c.isFeatured,
    })
  );
}

// lib/server/actions/data_bridge.ts
export async function getHomeProducts(limit = 10): Promise<JsonProduct[]> {
  const rows = await getHomeFeaturedProducts(limit); // <- keep the actual type
  return rows.map(r => ({
    id: r.id,
    // there's no "title" in the returned rows, so use description as a fallback name
    name: r.description || 'Untitled',
    description: r.description || '',
    price: r.price,            // already dollars (not cents)
    imageUrl: r.imageUrl || '',
    imageUrls: [],
    rating: 0,
    isFeatured: !!r.isFeatured,
  } as unknown as JsonProduct));
}


export async function getProductById(productId: string): Promise<JsonProduct | undefined> {
  const p = await getProductByIdWithDetails(productId);
  if (!p) return undefined;
  return {
    id: p.id,
    name: p.name ?? 'Untitled',
    description: p.description ?? '',
    price: p.price,
    imageUrl: p.imageUrl ?? '',
    imageUrls: p.imageUrls ?? [],
    rating: p.rating ?? 0,
    reviews: (p.reviews ?? []) as any,
  } as unknown as JsonProduct;
}

export async function getSimilarProducts(productId: string, limit = 6): Promise<JsonProduct[]> {
  const recos = await getTopRatedSimilarProducts(productId, limit);
  return recos.map(r => ({
    id: r.id,
    name: r.name ?? 'Untitled',
    description: r.description ?? '',
    price: r.price,
    imageUrl: r.imageUrl ?? '',
    imageUrls: r.imageUrls ?? [],
    rating: r.rating ?? 0,
    reviews: [],
  } as unknown as JsonProduct));
}

// ----------------- categories/collections -----------------
// lib/server/actions/data_bridge.ts
// lib/server/actions/data_bridge.ts
export async function getCategoriesData(): Promise<CategoryData[]> {
  const rows = await q<{
    id: string;
    name: string | null;
    image_path: string | null;      // derived from product_images
    product_ids: string[] | null;
  }>`
    WITH prod_ids AS (
      SELECT
        cp.collection_id,
        ARRAY_AGG(cp.product_id::text ORDER BY cp.position NULLS LAST, cp.product_id) AS product_ids
      FROM collection_products cp
      GROUP BY cp.collection_id
    )
    SELECT
      c.id::text AS id,
      c.name,
      img.url       AS image_path,
      p.product_ids AS product_ids
    FROM collections c
    LEFT JOIN prod_ids p ON p.collection_id = c.id

    -- pick one representative image per collection (primary image of one of its products)
    LEFT JOIN LATERAL (
      SELECT pi.url
      FROM collection_products cp2
      JOIN product_images    pi  ON pi.product_id = cp2.product_id
      WHERE cp2.collection_id = c.id
      ORDER BY COALESCE(pi.position, pi.sort_order, 999999), pi.created_at
      LIMIT 1
    ) img ON TRUE

    ORDER BY c.name NULLS LAST, c.id
  `;

  return rows.map(r => ({
    id: r.id,                                 // keep as string if your CategoryData.id is string
    name: r.name ?? "Untitled",
    imagePath: r.image_path ?? "/placeholder-category.jpg",
    productIds: r.product_ids ?? [],
    recommendedProductIds: [],
    isFeatured: false,
    story: "",
  }));
}



// ----------------- shipping/countries -----------------
// TODO: wire these to DB tables when you have them.
export async function getCountriesList(): Promise<string[]> {
  return [];
}

export async function getShippingOptions(): Promise<ShippingOption[]> {
  return [];
}

// ----------------- seller -----------------
export async function loadSellerData(sellerIdToLoad: string | number) {
  const cards: ProductCard[] = await fetchSellerProducts(String(sellerIdToLoad), 50, 0);

  const seller: Seller = {
    name: `Seller ${sellerIdToLoad}`,
    collectionName: 'Featured',
    photoUrl: '/default.jpg',
    aboutMeText: 'Profile data not provided.',
  };

 // NOTE: `products` here are ProductCard[] (fields: title, price_cents, primary_image, etc.)

  return { seller, products: cards };
}
