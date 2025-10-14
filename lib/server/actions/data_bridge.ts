// /lib/server/actions/data_bridge.ts
'use server';

import {
  fetchProductCards,
  fetchSellerProducts,
  fetchCountriesList
} from '@/lib/db';

import {
  getHomeFeaturedProducts,
  getProductById as repoGetProductById,
  getProductByIdWithDetails,
  getTopRatedSimilarProducts,

} from '@/lib/repositories/products';

import {
  getCollections
}  from '@/lib/repositories/collection';

// =======================================================
// NOVO: Importação do Repositório de Orders 
// (Agora importando createOrder e createOrderItems)
// =======================================================
import { createOrder, createOrderItems } from '@/lib/repositories/orders'; 

// Keep your existing JSON-facing types for compatibility with callers.
// We'll coerce DB results into these shapes.
import type {
  Product as JsonProduct,
  Collection as JsonCollections,
  CategoryData,
  ShippingOption,
  RawSellerProfile,
  Seller,
} from '@/lib/types/product-data';

// =======================================================
// NOVOS TIPOS DE DADOS PARA O CHECKOUT
// (Exportados para uso no PaymentOptionsTab.tsx)
// =======================================================

/** Estrutura de entrada do front-end (vindo do Local Storage/Componente) */
export interface OrderDataInput {
    shippingValue: string | null; 
    cartItems: string | null;
    shippingAddress: string | null;
    paymentMethod: string;        
    cardData: any | null;         
    summary: {                    
        subtotal: number;
        tax?: number;
        total: number;
    }; 
}

/** Estrutura do resultado retornado ao front-end */
export interface SaveOrderResult {
    success: boolean;
    orderId: string; // ID do pedido (UUID ou número)
}

/** Estrutura de dados esperada pelo Repositório/Tabela 'orders' */
interface OrderPayloadDB {
    buyer_id: string;
    shipping_address: string;
    billing_address: string;
    status: 'pending' | 'completed' | 'shipped' | 'cancelled'; // Assumindo enum no DB
    subtotal_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
    currency: string;
}

// --- NOVO: Estrutura para os itens do pedido no DB ---
/** Estrutura de dados esperada para cada item na tabela 'order_items' */
interface OrderItemPayloadDB {
    order_id: string;
    product_id: string;
    seller_id: string;
    title: string;
    quantity: number;
    price_cents: number;
    currency: string;
}

// --- NOVO: Estrutura dos itens crus do carrinho (Local Storage) ---
interface CartItemRaw {
    id: string;       // product_id
    name: string;     // title
    unitPrice: number;    // price in dollars
    quantity: number;
    sellerId?: string; // Assumindo que o Seller ID pode vir aqui
}


/* -------------------------------------------------------
   Helpers: DB → JSONish Product mapping
--------------------------------------------------------*/
const centsToDollars = (cents?: number | null) =>
  Math.round((cents ?? 0)) / 100;

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
    name: card.title,
    description: '',           // v_product_card doesn’t include description
    price: centsToDollars(card.price_cents),
    imageUrl: card.primary_image ?? '',
    imageUrls: [],             // not available from the card view
    rating: 0,                 // aggregate rating isn’t on the card view
  } as unknown as JsonProduct; // coerce to caller’s expected shape
}

export interface ProductCardData {
  id: string;
  title: string;
  price_cents: number;
  primary_image: string | null;
  // Assumimos que a coluna 'is_featured' foi selecionada com o alias 'isFeatured'
  isFeatured?: boolean; 
}
function cardToFullProduct(card: ProductCardData): JsonProduct {
// ... (código existente)
  return {
    id: card.id,
    sellerId: 0, // <-- DUMMY/VALOR PADRÃO
    name: card.title,
    description: '', // <-- DUMMY/VALOR PADRÃO
    price: centsToDollars(card.price_cents),
    imageUrl: card.primary_image ?? '',
    imageUrls: [], // <-- DUMMY/VALOR PADRÃO
    
    // CAMPOS BOOLEANOS E RATING
    isFeatured: card.isFeatured ?? false, 
    isNew: false, // <-- DUMMY/VALOR PADRÃO
    isOnSale: false, // <-- DUMMY/VALOR PADRÃO
    isBestSeller: false, // <-- DUMMY/VALOR PADRÃO
    rating: 0, // <-- DUMMY/VALOR PADRÃO
    displayOnMarketplace: true, // <-- DUMMY/VALOR PADRÃO
  } as JsonProduct;
}
/* -------------------------------------------------------
   Replacements for the old JSON bridge
--------------------------------------------------------*/

/** Returns products for general listing (shop grid). */
export async function getAllProducts(): Promise<JsonProduct[]> {
  const cards = await fetchProductCards(48, 0);
  return cards.map(cardToJsonProduct);
}

export async function getAllShopProducts(): Promise<JsonProduct[]> {
  const cards = await fetchProductCards(48, 0);
  return cards.map(cardToFullProduct);
}


// ... (Funções getHomeProducts, getProductById, getSimilarProducts, etc.)


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

// ------------------------------------------------------
// FUNÇÃO saveOrder AJUSTADA
// ------------------------------------------------------
export async function saveOrder(orderDataInput: OrderDataInput): Promise<SaveOrderResult> {
    console.log("Starting saveOrder process with input:", orderDataInput);

    // 1. ANÁLISE E VALIDAÇÃO DOS DADOS (Endereço e Itens)
    if (!orderDataInput.shippingAddress || !orderDataInput.cartItems) {
        console.error("Missing shipping address or cart items.");
        return { success: false, orderId: "0" };
    }
    
    let shippingAddressUUID: string;
    let rawCartItems: CartItemRaw[];
    
    try {
        const shippingAddressData = JSON.parse(orderDataInput.shippingAddress);
        // Usando um UUID válido como fallback, conforme sugerido
        shippingAddressUUID = shippingAddressData.id || shippingAddressData.uuid || '11d4fa2c-8ad0-4945-a4bd-a09cc2155d2e'; 
        
        rawCartItems = JSON.parse(orderDataInput.cartItems);

        if (rawCartItems.length === 0) {
            console.error("Cart items list is empty after parsing.");
            return { success: false, orderId: "0" };
        }
    } catch (e) {
        console.error("Error parsing input JSON (address or cart items):", e);
        return { success: false, orderId: "0" };
    }

    const summary = orderDataInput.summary;
    
    // 2. CONVERSÃO DE MOEDA (Dólar para Centavos)
    const subtotalInCents = dollarsToCents(summary.subtotal);
    const shippingInCents = dollarsToCents(parseFloat(orderDataInput.shippingValue || '0'));
    const taxInCents = dollarsToCents(summary.tax || 0);
    const totalInCents = dollarsToCents(summary.total);
    
    // 3. CRIAÇÃO DO PAYLOAD PARA A TABELA 'ORDERS'
    const BUYER_ID_PLACEHOLDER = '84cf35f4-a81b-442e-8bb1-02a521d91c95'; 
    
    const orderPayload: OrderPayloadDB = {
        buyer_id: BUYER_ID_PLACEHOLDER, 
        shipping_address: shippingAddressUUID, 
        billing_address: shippingAddressUUID, 
        status: 'pending', 
        
        // Valores em centavos (integer)
        subtotal_cents: subtotalInCents,
        shipping_cents: shippingInCents,
        tax_cents: taxInCents,
        total_cents: totalInCents,
        currency: 'USD',
    };
    
    try {
        // 4. CHAMADA 1: SALVAR O PEDIDO PRINCIPAL (ORDERS)
        const dbResult = await createOrder(orderPayload);
        const orderId = dbResult.id;
        console.log(`Order created successfully with ID: ${orderId}`);

        // 5. CRIAÇÃO DO PAYLOAD PARA A TABELA 'ORDER_ITEMS'
        const orderItemsPayload: OrderItemPayloadDB[] = rawCartItems.map(item => ({
            order_id: orderId,
            product_id: item.id,
            // Use o sellerId do item ou um placeholder (assumindo que 9s é um placeholder de "unknown seller")
            seller_id: item.sellerId || '94f5e8e2-36a0-4df6-8a75-27c91dd40972', 
            title: item.name,
            quantity: item.quantity,
            price_cents: dollarsToCents(item.unitPrice), // Preço unitário em centavos
            currency: 'USD',
        }));
        
        // 6. CHAMADA 2: SALVAR OS ITENS DO PEDIDO (ORDER_ITEMS)
        await createOrderItems(orderItemsPayload);
        console.log(`Successfully inserted ${orderItemsPayload.length} order items.`);


        // 7. RETORNO DE SUCESSO
        return {
            success: true,
            orderId: orderId 
        };

    } catch (error) {
        // ATENÇÃO: Em um sistema real, você faria um rollback da transação aqui se a primeira parte (createOrder)
        // tivesse sido bem-sucedida e a segunda (createOrderItems) falhasse.
        console.error("Erro fatal ao inserir pedido e/ou itens no DB:", error);
        return {
            success: false,
            orderId: "0"
        };
    }
}


/* -------------------------------------------------------
   Categories / Countries / Shipping
--------------------------------------------------------*/

/** If you have collections in DB and need full JSON CategoryData,
 * we can add a proper query here later. For now, return empty to avoid build errors.
 */
export async function getCategoriesData(): Promise<CategoryData[]> {
  const recos = await getCollections();
  return recos.map(r => ({
    id: r.id,
    name: r.name,
    isFeatured: r.isFeatured,
    story: r.story,
    imagePath: r.imagePath,
    productIds: r.productIds,
    recomendedProductIds: r.recommendedProductIds

  } as unknown as JsonCollections));
}


export type JsonCountry = {
  id: number;
  name: string;
};
export async function getCountriesList(): Promise<JsonCountry[]> { 
  
  const countries = await fetchCountriesList();
  
  if (!countries || countries.length === 0) {
    return [];
  }
  

  return countries.map(country => ({
    id: country.id,
    name: country.name,
  } as JsonCountry));
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