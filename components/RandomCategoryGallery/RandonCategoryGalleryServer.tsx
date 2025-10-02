import path from 'path';
import { promises as fs } from 'fs';

// CORREÇÃO AQUI: Assumindo que o nome do arquivo é RandomCategoryGallery.tsx
import RandomCategoryGallery from '@/components/RandomCategoryGallery/RandomCategoryGallery'; 

interface CategoryData { 
  name: string;
  imagePath: string;
}

interface JsonData {
    // Note: The key in the source JSON remains 'collections'; only the internal type name changes
    collections: CategoryData[]; 
}

/**
 * Function to fetch category data (formerly collections) from the local JSON file.
 */
async function getCategoriesData(): Promise<CategoryData[]> { 
  try {
    // Defines the file path from the project root (process.cwd())
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    // Reads the file content
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Parses the JSON
    const data: JsonData = JSON.parse(fileContents);
    
    // Returns the list of categories (which are 'collections' in the JSON)
    return data.collections;
  } catch (error) {
    console.error("Error loading data from products.json:", error);
    // In case of error, returns an empty array to prevent failure
    return [];
  }
}

export default async function RandomCategoryGalleryServer() { 
    // 1. Fetches the data on the server during build or request
    const categories = await getCategoriesData(); 
    
    // 2. Passes the data to the Client Component
    return (
        <RandomCategoryGallery allCategories={categories} /> 
        
    );
}
