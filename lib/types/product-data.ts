export interface Product {
    id: string;
    name: string; // Used as description on the card
    description: string;
    imageUrl: string;
    price: number;
    isFeatured: boolean;
    isNew: boolean;
    isOnSale: boolean;
    isBestSeller: boolean;
    rating: number;
    displayOnMarketplace: boolean;
}

export interface Collection {
    id: number;
    name: string;
    isFeatured: boolean;
    story: string;
    imagePath: string;
    productIds: string[];         // Necessário para o filtro
    recommendedProductIds: string[]; // Necessário para o filtro
}



export interface CategoryData { 
    id: number;
    name: string;
    isFeatured: boolean;
    story: string;
    imagePath: string;
    productIds: string[];         // Necessário para o filtro
    recommendedProductIds: string[]; // Necessário para o filtro
}


/**
 * Interface defining the structure of a single shipping option
 * based on the provided JSON data.
 */
export interface ShippingOption {
    id: number; // Numeric ID
    name: string; // Name (e.g., "Standard Shipping")
    type: string; // New field for shipping type (e.g., "standard", "express")
    cost: number; // Base cost
    description: string; 
    estimatedDays: string;
}



/**
 * Interface defining the COMPLETE structure of the main JSON data source (products.json).
 */
export interface FullDataSource {
    products: Product[];
    collections: CategoryData[];
    sellerProfiles: RawSellerProfile[];
    countries: string[]; 
    shipping_options: ShippingOption[]; // Correctly typed as an array of ShippingOption objects
}

export interface RawSellerProfile {
    sellerId: number;
    name: string;
    photoUrl: string;
    aboutMe: string;
    collectionIds: number[];
}

export type Seller = {
  name: string;
  collectionName: string;
  photoUrl: string;
  aboutMeText: string;
};

export type ButtonVariant = 'primary' | 'secondary' | 'delete';

export interface AdminProductCardProps {
    product: Product; // Usa o tipo Product completo fornecido
}