import RandomCategoryGallery from '@/components/RandomCategoryGallery/RandomCategoryGallery';

// 1) Import the data loading function from our Data Bridge
import { getCategoriesData } from '@/lib/server/actions/data_bridge';

// 2) Import the CategoryData type
import type { CategoryData } from '@/lib/types/product-data';

/**
 * Server component responsible for fetching category data
 * and passing it to the client component.
 */
export default async function RandomCategoryGalleryServer() {
  // getCategoriesData returns a Promise<CategoryData[]>, so await it
  const categories: CategoryData[] = await getCategoriesData();

  // Pass the data to the Client Component
  return <RandomCategoryGallery allCategories={categories} />;
}
