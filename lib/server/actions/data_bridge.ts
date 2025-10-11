// /lib/server/actions/data_bridge.ts
'use server';

import {
  fetchProductCards,
  fetchSellerProducts,
} from '@/lib/db';

import {
  getHomeFeaturedProducts,
  getProductById as repoGetProductById,
  getProductByIdWithDetails,
  getTopRatedSimilarProducts,
} from '@/lib/repositories/products';

// Keep your existing JSON-facing types for compatibility with callers.
// We'll coerce DB results into these shapes.
import type {
  Product as JsonProduct,
  CategoryData,
  ShippingOption,
  RawSellerProfile,
  Seller,
} from '@/lib/types/product-data';

/* -------------------------------------------------------
   Helpers: DB → JSONish Product mapping
   (Your v_product_card view has: id, title, price_cents, primary_image)
--------------------------------------------------------*/
const centsToDollars = (cents?: number | null) =>
  Math.round((cents ?? 0)) / 100;

function cardToJsonProduct(card: {
  id: string;
  title: string;
  price_cents: number;
  primary_image: string | null;
}): JsonProduct {
  return {
    id: card.id,
    name: card.title,
    description: '',           // v_product_card doesn’t include description
    price: centsToDollars(card.price_cents),
    imageUrl: card.primary_image ?? '',
    // The JSON schema often had these in some places:
    imageUrls: [],             // not available from the card view
    rating: 0,                 // aggregate rating isn’t on the card view
  } as unknown as JsonProduct; // coerce to caller’s expected shape
}

/* -------------------------------------------------------
   Replacements for the old JSON bridge
--------------------------------------------------------*/

/** Returns products for general listing (shop grid). */
export async function getAllProducts(): Promise<JsonProduct[]> {
  const cards = await fetchProductCards(48, 0);
  return cards.map(cardToJsonProduct);
}

/** Returns featured products for the home section. */
export async function getHomeProducts(limit = 10): Promise<JsonProduct[]> {
  const rows = await getHomeFeaturedProducts(limit);
  // rows have: id, imageUrl, description, price, isFeatured
  return rows.map(r => ({
    id: r.id,
    name: r.description || 'Untitled',
    description: r.description,
    price: r.price,
    imageUrl: r.imageUrl,
    imageUrls: [],
    rating: 0,
  } as unknown as JsonProduct));
}

/** Loads a single product by ID with gallery, rating, reviews. */
export async function getProductById(productId: string): Promise<JsonProduct | undefined> {
  const p = await getProductByIdWithDetails(productId);
  if (!p) return undefined;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrls ?? [],
    rating: p.rating ?? 0,
    // If your JSON Product type does not include reviews, callers will ignore this.
    // If it does, it will be present here from the DB:
    reviews: p.reviews as any,
  } as unknown as JsonProduct;
}

/** Returns “similar” products (same collections, top rated). */
export async function getSimilarProducts(productId: string, limit = 6): Promise<JsonProduct[]> {
  const recos = await getTopRatedSimilarProducts(productId, limit);
  return recos.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    imageUrl: r.imageUrl,
    imageUrls: r.imageUrls ?? [],
    rating: r.rating ?? 0,
    reviews: [],
  } as unknown as JsonProduct));
}

/* -------------------------------------------------------
   Categories / Countries / Shipping
   (If you don’t have these in DB yet, return safe fallbacks)
--------------------------------------------------------*/

/** If you have collections in DB and need full JSON CategoryData,
 *  we can add a proper query here later. For now, return empty to avoid build errors.
 */
export async function getCategoriesData(): Promise<CategoryData[]> {
  return [];
}

export async function getCountriesList(): Promise<string[]> {
  return [];
}

export async function getShippingOptions(): Promise<ShippingOption[]> {
  return [];
}

/* -------------------------------------------------------
   Seller data
   Map to your Seller + products using seller_id on products
--------------------------------------------------------*/
export async function loadSellerData(
  sellerIdToLoad: number | string = 1
): Promise<{ seller: Seller; products: JsonProduct[] }> {
  // Products for this seller
  const cards = await fetchSellerProducts(String(sellerIdToLoad), 50, 0);

  // Minimal seller profile 
  const seller: Seller = {
    name: `Seller ${sellerIdToLoad}`,
    collectionName: 'Featured',
    photoUrl: '/default.jpg',
    aboutMeText: 'Profile data not provided.',
  };

  const products = cards.map(cardToJsonProduct);
  return { seller, products };
}
