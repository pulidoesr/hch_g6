// /lib/server/actions/data_bridge.ts (ou data-bridge.tsx)

import Products from '@/data/products.json';

// Importa todos os tipos necessários
import { 
    Product, 
    CategoryData, 
    ShippingOption, 
    FullDataSource, 
    RawSellerProfile, // Interface do perfil bruto
    Seller // Tipo do perfil transformado
} from '@/lib/types/product-data'; 

// --- CORREÇÃO DA IMPORTAÇÃO JSON ---
const rawDataCandidate = (Products as any).default || Products;
const rawData = rawDataCandidate as FullDataSource;
// ------------------------------------


// ------------------------------------
// FUNÇÕES DE BUSCA GERAL (EXISTENTES)
// ------------------------------------

/**
 * Returns all products ('products' section of the JSON).
 * @returns {Product[]} A list of products.
 */
export function getAllProducts(): Product[] {
    return rawData.products;
}

/**
 * Returns collections/categories data ('collections' section of the JSON).
 * @returns {CategoryData[]} A list of category data.
 */
export function getCategoriesData(): CategoryData[] {
    return rawData.collections;
}

/**
 * Returns the list of countries ('countries' section of the JSON).
 * @returns {string[]} A list of country names.
 */
export function getCountriesList(): string[] {
    return rawData.countries;
}

/**
 * Returns the available shipping options, now as an array of detailed objects.
 * @returns {ShippingOption[]} A list of detailed shipping option objects.
 */
export function getShippingOptions(): ShippingOption[] {
    return rawData.shipping_options;
}


// ------------------------------------
// FUNÇÃO DE TRANSFORMAÇÃO PARA O VENDEDOR (loadSellerData)
// ------------------------------------

/**
 * Carrega e processa os dados de um vendedor e seus produtos a partir do JSON completo.
 * @param sellerIdToLoad O ID do vendedor a ser carregado.
 * @returns Um objeto contendo o perfil do Seller (Seller) e a lista de Products (Product[]) da sua coleção principal.
 */
export function loadSellerData(sellerIdToLoad: number = 1): { seller: Seller; products: Product[]; } {
  const sellerProfiles: RawSellerProfile[] = rawData.sellerProfiles;
  const collections: CategoryData[] = rawData.collections;
  const rawProducts: Product[] = rawData.products;

  // 1. Encontrar o Perfil do Vendedor
  const sellerData = sellerProfiles.find(s => s.sellerId === sellerIdToLoad);
  
  if (!sellerData) {
    console.error(`Seller with ID ${sellerIdToLoad} not found.`);
    return {
        seller: { 
            name: "Seller Not Found", 
            collectionName: "N/A", 
            photoUrl: "/default.jpg", 
            aboutMeText: "Profile data missing." 
        },
        products: []
    }
  }

  // 2. Encontrar a(s) Coleção(ões) do Vendedor
  // Foca na primeira collectionId do vendedor
  const collectionId = sellerData.collectionIds[0]; 
  const collectionData = collections.find(c => c.id === collectionId);
  
  const collectionName = collectionData?.name || "Coleção Não Categorizada";
  const productIds = collectionData?.productIds || [];

  // 3. Filtrar os Produtos (Aproveitando a interface Product existente)
  const sellerProducts: Product[] = rawProducts
    .filter(p => productIds.includes(p.id));

  // 4. Mapear para o tipo Seller final (limpo)
  const sellerProfile: Seller = {
    name: sellerData.name,
    collectionName: collectionName,
    photoUrl: sellerData.photoUrl,
    aboutMeText: sellerData.aboutMe,
  };

  return { seller: sellerProfile, products: sellerProducts };
}