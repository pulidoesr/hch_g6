import ProductList from "@/components/ProductList/ProductList";
import { Product, CategoryData } from "@/lib/types/product-data";
import { 
    getAllProducts, 
    getCategoriesData,
} from '@/lib/server/actions/data_bridge';

// 1. Carregamento de dados SÍNCRONO no Server Component
const allProducts: Product[] = getAllProducts();
const allCategories: CategoryData[] = getCategoriesData(); 

interface SearchParams {
  // ----------------------------------------------------
  // CORREÇÃO 1: Mudar a interface para esperar 'categoryId'
  // ----------------------------------------------------
  categoryId?: string; // AGORA EX: '3' (ID da categoria)
  filter?: string;     // Ex: 'sale', 'new', 'bestseller' (filtro de estado)
  query?: string;      // Pesquisa de texto livre (opcional)
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // ----------------------------------------------------
  // CORREÇÃO 2: Desestruturar 'categoryId'
  // ----------------------------------------------------
  const { categoryId, filter, query } = searchParams;

  // Inicia com a lista completa de produtos
  let products: Product[] = allProducts;

  // 2. FILTRO POR CATEGORIA (usando categoryId)
  console.log("Filtering by category ID:", categoryId);
  
  // ----------------------------------------------------
  // CORREÇÃO 3: Usar 'categoryId' na lógica de filtragem
  // ----------------------------------------------------
  if (categoryId) {
    const targetCollection = allCategories.find(c => 
      // Compara o ID da coleção (string) com o ID da URL (string)
      c.id.toString() === categoryId
    );
    console.log("Target Collection:", targetCollection);

    if (targetCollection) {
      const categoryProductIds = [
        ...targetCollection.productIds,
        ...targetCollection.recommendedProductIds
      ];
      const uniqueCategoryProductIds = Array.from(new Set(categoryProductIds));

      products = products.filter(product => uniqueCategoryProductIds.includes(product.id));
    } else {
        products = [];
    }
  }

  // 3. FILTRO POR ESTADO (mantido)
  if (filter) {
    switch (filter.toLowerCase()) {
      case 'sale':
        products = products.filter(product => product.isOnSale === true);
        break;
      case 'new':
        products = products.filter(product => product.isNew === true);
        break;
      case 'bestseller':
        products = products.filter(product => product.isBestSeller === true);
        break;
    }
  }

  // 4. PESQUISA DE TEXTO LIVRE (mantido)
  if (query) {
      products = products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Product Offers
      </h1>
      <ProductList products={products} />
    </div>
  );
}
