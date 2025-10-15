// app/products/page.tsx
import ProductList from "@/components/ProductList/ProductList";
import { getAllShopProducts, getCategoriesData } from "@/lib/server/actions/data_bridge";
import RandomCategoryGalleryServer from "@/components/RandomCategoryGallery/RandonCategoryGalleryServer";

type SearchParams = {
  categoryId?: string;
  filter?: string;
  query?: string;
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  // ✅ Next 15: searchParams is a Promise
  searchParams: Promise<SearchParams>;
}) {
  const { categoryId, filter, query } = await searchParams;

  // Fetch all products & categories once
  const [allProducts, allCategories] = await Promise.all([
    getAllShopProducts(),  // Product[]
    getCategoriesData(),   // CategoryData[]
  ]);

  let products = allProducts;

  // ---------- Category filter ----------
  if (categoryId) {
    const catId = String(categoryId);

    // Prefer IDs listed on the category (if your backend provides them)
    const target = (allCategories ?? []).find((c: any) => String(c?.id) === catId);

    const idsFromCategory: string[] = Array.from(
      new Set([
        ...((target as any)?.productIds ?? []),
        ...((target as any)?.recommendedProductIds ?? []),
      ].map(String)),
    );

    if (idsFromCategory.length > 0) {
      products = products.filter((p: any) => idsFromCategory.includes(String(p.id)));
    } else {
      // Fallbacks based on common product shapes
      products = products.filter((p: any) => {
        if (Array.isArray(p.categoryIds) && p.categoryIds.some((id: any) => String(id) === catId)) return true;
        if (p.categoryId && String(p.categoryId) === catId) return true;
        if (Array.isArray(p.categories) && p.categories.some((c: any) => String(c?.id) === catId)) return true;
        if (Array.isArray(p.category_ids) && p.category_ids.some((id: any) => String(id) === catId)) return true;
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
        String(p.description ?? "").toLowerCase().includes(q),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 mt-10">
      {/* ✅ Category tiles at the top, fetched on the server */}
      <RandomCategoryGalleryServer />

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
