import RandomCategoryGallery from '@/components/RandomCategoryGallery/RandomCategoryGallery'; 

// 1. Imports the data loading function from our Data Bridge
import { getCategoriesData } from '@/lib/server/actions/data_bridge';
// 2. Imports the CategoryData type from the types file, which is used by the imported function
import { CategoryData } from '@/lib/types/product-data';

// The CategoryData interface and the local loading function were removed,
// because the logic is now centralized in the data-bridge.

/**
 * Server component responsible for fetching category data 
 * and passing it to the client component.
 */
export default async function RandomCategoryGalleryServer() { 
    
    // Calls the centralized function. 
    // Since the getCategoriesData function is no longer asynchronous (it reads from memory after import),
    // technically we wouldn't need 'await' anymore if it were typed to return CategoryData[],
    // but keeping it is safe, in case the data-bridge becomes asynchronous in the future.
    // In this case, if it is synchronous, 'await' does no harm.
    const categories: CategoryData[] = getCategoriesData(); 
    
    // 2. Passes the data to the Client Component
    return (
        <RandomCategoryGallery allCategories={categories} /> 
    );
}
