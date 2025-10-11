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

    const categories: CategoryData[] = getCategoriesData(); 
    
    // 2. Passes the data to the Client Component
    return (
        <RandomCategoryGallery allCategories={categories} /> 
    );
}
