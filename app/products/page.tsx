// app/products/page.tsx
import ProductList from "@/components/ProductList/ProductList";
import type { Product, CategoryData } from "@/lib/types/product-data";
import { getAllShopProducts, getCategoriesData } from "@/lib/server/actions/data_bridge";

interface SearchParams {
  categoryId?: string; // this is really a collection id now
  filter?: string;
  query?: string;
}

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { categoryId, filter, query } = await searchParams;

  const [allProducts, allCategories] = await Promise.all([
    getAllShopProducts(),
    getCategoriesData(),
  ]);

  let products: Product[] = allProducts;

  if (categoryId) {
    const target = (allCategories ?? []).find(c => String(c.id) === String(categoryId));
    const idsFromCollection = target?.productIds ?? [];
    products = idsFromCollection.length
      ? products.filter((p: any) => idsFromCollection.includes(String(p.id)))
      : [];
  }

  if (filter) {
    const f = filter.toLowerCase();
    if (f === "sale")       products = products.filter((p: any) => p.isOnSale === true);
    if (f === "new")        products = products.filter((p: any) => p.isNew === true);
    if (f === "bestseller") products = products.filter((p: any) => p.isBestSeller === true);
  }

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
