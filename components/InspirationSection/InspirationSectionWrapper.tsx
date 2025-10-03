import InspirationSection from "./InspirationSection";

// Product data type simulation
export interface Product { // EXPORTED for use in client component
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    rating: number;
    isFeatured?: boolean;
}

// Interface representing the full structure of the imported products.json file.
// It contains arrays for 'collections' and 'products'.
interface ProductsJsonStructure {
    collections: any[];
    products: Product[]; // This is the flat array of products we need
}

// 1. SERVER DATA LOADING
// In a real Next.js environment, the import below synchronously loads the JSON content directly into the Node.js runtime/build.
// We are simulating the required import structure here.
import productsJsonData from "@/data/products.json";


/**
 * Server Component responsible for loading the data.
 * It reads the data from the JSON file and passes it to the client component.
 */
export default async function InspirationSectionWrapper() {
    
    // 1. DATA LOADING AND PROCESSING (On the Server/Node.js)
    // First, assert the imported data to the full JSON structure.
    const rawData = productsJsonData as unknown as ProductsJsonStructure;

    // Then, extract the flat list of products from the 'products' property.
    // This resolves the TypeScript error by matching the actual JSON structure.
    const productsData: Product[] = rawData.products; 
    
    // 2. PROP PASSING to the Client Component
    // The client component receives the data ready, eliminating the need for async loading logic.
    return (
        <InspirationSection productsData={productsData} />
    );
}
