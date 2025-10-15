import RandomCategoryGallery from "@/components/RandomCategoryGallery/RandomCategoryGallery";
import { getCategoriesData } from "@/lib/server/actions/data_bridge";
import type { CategoryData } from "@/lib/types/product-data";

export default async function RandomCategoryGalleryServer() {
  try {
    const categories: CategoryData[] = await getCategoriesData();

    if (!categories || categories.length === 0) {
      return (
        <section className="py-8">
          <h2 className="text-2xl font-bold mb-3">Categories</h2>
          <p className="text-sm text-gray-500">No categories found.</p>
        </section>
      );
    }

    return <RandomCategoryGallery allCategories={categories} />;
  } catch (err) {
    console.error("getCategoriesData failed:", err);
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-3">Categories</h2>
        <p className="text-sm text-red-600">Failed to load categories.</p>
      </section>
    );
  }
}
