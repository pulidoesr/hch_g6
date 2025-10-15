import ProductList from "@/components/ProductList/ProductList";
import type { Product, CategoryData } from "@/lib/types/product-data";
import { getAllShopProducts, getCategoriesData } from "@/lib/server/actions/data_bridge";

interface SearchParams {
  categoryId?: string;
  filter?: string;
  query?: string;
}

export const revalidate = 60; // optional

export default async function ProductsPage({
  searchParams,
}: {
  // ✅ Next 15: searchParams is a Promise
  searchParams: Promise<SearchParams>;
}) {
  const { categoryId, filter, query } = await searchParams;


  const [allProducts, allCategories] = await Promise.all([
    getAllShopProducts(),     // Product[]
    getCategoriesData(),  // CategoryData[]
  ]);

  let products = allProducts;
    // Category filter
  if (categoryId) {
    const target = allCategories.find(
      (c: CategoryData) => String(c.id) === String(categoryId)
    );
    console.log("Target category:", target);
    if (target) {

      // CORREÇÃO APLICADA AQUI: Usando os nomes exatos do objeto target
      const ids = Array.from(
        new Set([
          ...(target.productIds ?? []),            // Adicionado 's' ao productsIds
          ...(target.recommendedProductIds ?? [])  // Usado o nome com o typo
        ])
      );
      
      products = products.filter((p) => ids.includes(p.id));
    } else {
      products = [];
    }
  }

  // State filter (if your Product type doesn’t include these flags, cast or extend types)
  if (filter) {
    const f = filter.toLowerCase();
    if (f === "sale") products = products.filter((p: any) => p.isOnSale === true);
    if (f === "new") products = products.filter((p: any) => p.isNew === true);
    if (f === "bestseller") products = products.filter((p: any) => p.isBestSeller === true);
  }
  // Text search
  if (query) {
    
    const q = query.toLowerCase();
    products = products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Offers</h1>
      <ProductList products={products} />
    </div>
  );
}
