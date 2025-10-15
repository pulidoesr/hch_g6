import ProductList from "@/components/ProductList/ProductList";
import type { Product, CategoryData } from "@/lib/types/product-data";
import { getAllShopProducts, getCategoriesData } from "@/lib/server/actions/data_bridge";
import RandomCategoryGalleryServer from '@/components/RandomCategoryGallery/RandonCategoryGalleryServer';
interface SearchParams {
  categoryId?: string;
  filter?: string;
  query?: string;
}

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>; // Next 15 async searchParams
}) {
  const { categoryId, filter, query } = await searchParams;

  const [allProducts, allCategories] = await Promise.all([
    getAllShopProducts(),   // Product[]
    getCategoriesData(),    // CategoryData[]
  ]);

  let products: Product[] = allProducts;

  // ---------- Category filter (robust, product-first) ----------
  if (categoryId) {
    const catId = String(categoryId);

    // Some backends put product ids on the category object. If present, use them first.
    const target = (allCategories ?? []).find((c: any) => String(c?.id) === catId);

    const idsFromCategory: string[] = Array.from(
      new Set([
        ...((target as any)?.productIds ?? []),
        ...((target as any)?.recommendedProductIds ?? []),
      ].map(String))
    );

    if (idsFromCategory.length > 0) {
      products = products.filter((p: any) => idsFromCategory.includes(String(p.id)));
    } else {
      // Fallbacks that only look at the product shape
      products = products.filter((p: any) => {
        // try a few common shapes
        if (Array.isArray(p.categoryIds) && p.categoryIds.some((id: any) => String(id) === catId)) {
          return true;
        }
        if (p.categoryId && String(p.categoryId) === catId) {
          return true;
        }
        if (Array.isArray(p.categories) && p.categories.some((c: any) => String(c?.id) === catId)) {
          return true;
        }
        if (Array.isArray(p.category_ids) && p.category_ids.some((id: any) => String(id) === catId)) {
          return true;
        }
        return false;
      });
    }
  }

  // ---------- State filter ----------
  if (filter) {
    const f = filter.toLowerCase();
    if (f === "sale")       products = products.filter((p: any) => p.isOnSale === true);
    if (f === "new")        products = products.filter((p: any) => p.isNew === true);
    if (f === "bestseller") products = products.filter((p: any) => p.isBestSeller === true);
  }

  // ---------- Text search ----------
  if (query) {
    const q = query.toLowerCase();
    products = products.filter(
      (p: any) =>
        String(p.name ?? "").toLowerCase().includes(q) ||
        String(p.description ?? "").toLowerCase().includes(q)
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Offers</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">
          No products found{categoryId ? " for this category" : ""}.
        </p>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
