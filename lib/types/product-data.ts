export interface Product {
    id: string;
    name: string; // Used as description on the card
    imageUrl: string;
    price: number;
    isFeatured: boolean;
    rating: number;
}

export interface CategoryData { 
  name: string;
  imagePath: string;
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
    countries: string[]; 
    shipping_options: ShippingOption[]; // Correctly typed as an array of ShippingOption objects
}
