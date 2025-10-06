// data-bridge.tsx

import Products from '@/data/products.json';

// Importa os tipos necessários para o Data Bridge
import { 
    Product, 
    CategoryData, 
    ShippingOption, 
    FullDataSource, 
    Seller, // O tipo Seller que será retornado
    RawSellerProfile 
} from '@/types'; 

// --- CORREÇÃO DA IMPORTAÇÃO JSON ---
// Lida com a forma como o bundler do Next.js pode embrulhar o JSON.
const rawDataCandidate = (Products as any).default || Products;

// Tipamos o candidato a rawData com a estrutura FullDataSource.
const rawData = rawDataCandidate as FullDataSource;
// ------------------------------------


// ------------------------------------
// FUNÇÕES DE BUSCA GERAL (EXISTENTES)
// ------------------------------------

export function getAllProducts(): Product[] {
    return rawData.products;
}

export function getCategoriesData(): CategoryData[] {
    return rawData.collections;
}

export function getCountriesList(): string[] {
    return rawData.countries;
}

export function getShippingOptions(): ShippingOption[] {
    return rawData.shipping_options;
}


// ------------------------------------
// FUNÇÃO DE TRANSFORMAÇÃO PARA O VENDEDOR (MOVIMENTO DE data-utils.ts)
// ------------------------------------

/**
 * Carrega e processa os dados de um vendedor e seus produtos a partir do JSON completo.
 * @param sellerIdToLoad O ID do vendedor a ser carregado.
 * @returns Um objeto contendo o perfil do Seller e a lista de Products da sua coleção principal.
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
        seller: { name: "Seller Not Found", collectionName: "N/A", photoUrl: "/default.jpg", aboutMeText: "Profile data missing." },
        products: []
    }
  }

  // 2. Encontrar a(s) Coleção(ões) do Vendedor
  const collectionId = sellerData.collectionIds[0]; 
  const collectionData = collections.find(c => c.id === collectionId);
  
  const collectionName = collectionData?.name || "Coleção Não Categorizada";
  const productIds = collectionData?.productIds || [];

  // 3. Filtrar os Produtos 
  const sellerProducts: Product[] = rawProducts
    .filter(p => productIds.includes(p.id));

  // 4. Mapear para o tipo Seller final
  const sellerProfile: Seller = {
    name: sellerData.name,
    collectionName: collectionName,
    photoUrl: sellerData.photoUrl,
    aboutMeText: sellerData.aboutMe,
  };

  return { seller: sellerProfile, products: sellerProducts };
}