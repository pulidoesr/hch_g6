// lib/server/actions/data_bridge.ts
'use server';

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


// ... (rest of file unchanged)


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
export async function getCategoriesData(): Promise<CategoryData[]> {
  // DB-backed collections
  const rows = await getCollections();
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    imagePath: r.imagePath ?? '',
    story: r.story ?? '',
    isFeatured: !!r.isFeatured,
    productsIds: r.productIds ?? [],
    recomendedProducysIds: r.recommendedProductIds ?? [], 
  } as unknown as CategoryData));
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
