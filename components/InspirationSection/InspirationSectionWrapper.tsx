import InspirationSection from "./InspirationSection";
// Importe o tipo Product de onde ele é realmente definido, 
// em vez de defini-lo aqui.
// O caminho exato pode variar, mas usaremos o que o erro sugere.
import { Product } from '@/lib/types/product-data'; 


// 1. SERVER DATA LOADING
// ... (O resto do código permanece o mesmo)
import { getAllProducts } from '@/lib/server/actions/data_bridge';



/**
 * Server Component responsible for loading the data.
 * It reads the data from the JSON file and passes it to the client component.
 */
export default async function InspirationSectionWrapper() {
    
    // 1. DATA LOADING AND PROCESSING (On the Server/Node.js)
    // First, assert the imported data to the full JSON structure.
    const rawData = getAllProducts();

    // Then, extract the flat list of products from the 'products' property.
    // This resolves the TypeScript error by matching the actual JSON structure.
    // Garanta que productsData tem o tipo Product[] importado
    const productsData: Product[] = rawData; 
    
    // 2. PROP PASSING to the Client Component
    // The client component receives the data ready, eliminating the need for async loading logic.
    return (
        <InspirationSection productsData={productsData} />
    );
}
