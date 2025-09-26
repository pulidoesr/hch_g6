// src/app/product_detail/[id]/page.tsx
import ProductClient from './ProductClient';
import productsData from '../../../../data/products.json';

// Importa o tipo PageProps do global
// (O tipo é global, não precisa importar, mas pode ser referenciado)

interface Review {
  customerName: string;
  customerImage: string;
  rating: number;
  date: string;
  comment: string;
}

interface Product {
  id: string;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  name: string;
  price: number;
  rating: number;
  reviews: Review[];
}

interface Collection {
  id: number;
  isFeatured: boolean;
  productIds: string[];
}

// Corrige para usar PageProps conforme o arquivo gerado
export default async function ProductPage(props: PageProps<'/product_detail/[id]'>) {
  const { id } = await props.params;

  let products: Product[] = [];
  let collections: Collection[] = [];

  // Detecta ambiente de build/prerender
  const isBuild = typeof window === 'undefined' && process.env.NODE_ENV === 'production';
  if (isBuild) {
    // Usa dados mockados do arquivo JSON
    products = productsData.products as Product[];
    collections = productsData.collections as Collection[];
  } else {
    // Busca os dados da API normalmente
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    products = data.products;
    collections = data.collections;
  }

  // Encontra o produto específico pelo ID
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div>Product not found.</div>;
  }

  // Encontra a coleção do produto atual
  const currentCollection = collections.find(c => c.productIds.includes(product.id));
  
  // Filtra os produtos da mesma coleção (excluindo o produto atual)
  const similarProducts = products.filter(p => 
    currentCollection?.productIds.includes(p.id) && p.id !== product.id
  );

  // Classifica os produtos por avaliação (rating) em ordem decrescente e pega os 6 primeiros
  const topRatedSimilarProducts = similarProducts
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <ProductClient product={product} similarProducts={topRatedSimilarProducts} />
  );
}