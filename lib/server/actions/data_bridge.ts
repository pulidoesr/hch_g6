// /lib/server/actions/data_bridge.ts (or data-bridge.tsx)

import Products from '@/data/products.json';

// Imports all necessary types
import { 
    Product, 
    CategoryData, 
    ShippingOption, 
    FullDataSource, 
    RawSellerProfile, // Raw profile interface
    Seller // Transformed profile type
} from '@/lib/types/product-data'; 

// --- JSON IMPORT CORRECTION ---
const rawDataCandidate = (Products as any).default || Products;
const rawData = rawDataCandidate as FullDataSource;
// ------------------------------------


// ------------------------------------
// GENERAL FETCH FUNCTIONS (EXISTING)
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
// SELLER TRANSFORMATION FUNCTION (loadSellerData)
// ------------------------------------

/**
 * Loads and processes a seller's data and their products from the complete JSON.
 * @param sellerIdToLoad The ID of the seller to be loaded.
 * @returns An object containing the Seller profile (Seller) and the list of Products (Product[]) from their main collection.
 */
export function loadSellerData(sellerIdToLoad: number = 1): { seller: Seller; products: Product[]; } {
  const sellerProfiles: RawSellerProfile[] = rawData.sellerProfiles;
  const collections: CategoryData[] = rawData.collections;
  const rawProducts: Product[] = rawData.products;

  // 1. Find the Seller Profile
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

  // 2. Find the Seller's Collection(s)
  // Focuses on the seller's first collectionId
  const collectionId = sellerData.collectionIds[0]; 
  const collectionData = collections.find(c => c.id === collectionId);
  
  const collectionName = collectionData?.name || "Uncategorized Collection";
  const productIds = collectionData?.productIds || [];

  // 3. Filter the Products (Leveraging the existing Product interface)
  const sellerProducts: Product[] = rawProducts
    .filter(p => productIds.includes(p.id));

  // 4. Map to the final Seller type (clean)
  const sellerProfile: Seller = {
    name: sellerData.name,
    collectionName: collectionName,
    photoUrl: sellerData.photoUrl,
    aboutMeText: sellerData.aboutMe,
  };

  return { seller: sellerProfile, products: sellerProducts };
}

// ------------------------------------
// FUNCTION TO FETCH A SINGLE PRODUCT 
// ------------------------------------
/**
 * Fetches a single product by ID.
 * @param productId The ID of the product to be loaded.
 * @returns The Product object or undefined if not found.
 */
export function getProductById(productId: string): Product | undefined {
    // Reuses the getAllProducts function (or uses rawData.products directly)
    const allProducts = rawData.products; 
    return allProducts.find(p => p.id === productId);
}