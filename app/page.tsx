import Image from "next/image";
import Link from 'next/link';
import ProductCard from "@/components/ProductCard/ProductCard";
import productsData from '@/data/products.json';

interface Product {
  id: string; // O ID do produto no JSON é uma string
  imageUrl: string;
  description: string;
  price: number;
  isFeatured: boolean; // Adicione o campo isFeatured
}

// 1. Defina a interface para o tipo 'Collection'
interface Collection {
  id: number;
  isFeatured: boolean;
  productIds: string[];
}
const data = productsData;
export default async function Page() {
  
  const products: Product[] = data.products;
  const collections: Collection[] = data.collections;

  if (!products || !collections) {
    return <div>Loading products...</div>;
  }

  // 2. Crie uma função para buscar os produtos em destaque
  const getFeaturedProducts = (): Product[] => {
    const featuredProducts: Product[] = [];
    const featuredCollections = collections.filter(collection => collection.isFeatured);
    const nonFeaturedCollections = collections.filter(collection => !collection.isFeatured);
    
    // Mapeamento para rastrear os índices de cada coleção
    const collectionIndices: { [key: number]: number } = {};
    featuredCollections.forEach(collection => {
      collectionIndices[collection.id] = 0;
    });

    // Mapeamento de IDs de produto para objetos de produto
    const productMap = new Map(products.map(product => [product.id, product]));

  let currentCollectionIndex = 0;
    
    // Preencha até 10 produtos
    while (featuredProducts.length < 10) {
      if (featuredCollections.length === 0 && nonFeaturedCollections.length === 0) {
        break; // Saia se não houver mais coleções
      }
      
      const collectionsToIterate = featuredCollections.length > 0 ? featuredCollections : nonFeaturedCollections;
      const currentCollection = collectionsToIterate[currentCollectionIndex];

      const currentProductIds = currentCollection.productIds;
      const currentProductIndex = collectionIndices[currentCollection.id] || 0;

      if (currentProductIndex < currentProductIds.length) {
        const productId = currentProductIds[currentProductIndex];
        const product = productMap.get(productId);

        if (product && product.isFeatured) {
            featuredProducts.push(product);
        } else if (featuredCollections.length === 0) {
            // Se já esgotamos as coleções featured, usamos qualquer produto
            if (product && !featuredProducts.includes(product)) {
                featuredProducts.push(product);
            }
        }
        
        // Avance para o próximo produto na coleção
        collectionIndices[currentCollection.id] = currentProductIndex + 1;
      }

      // Vá para a próxima coleção
      currentCollectionIndex = (currentCollectionIndex + 1) % collectionsToIterate.length;

      // Se a fila de destaque está vazia, e não há mais produtos featured, comece a pegar produtos não-featured
      if (featuredProducts.length < 10 && currentCollectionIndex === 0) {
        let anyNewProductAdded = false;
        
        for (const collection of nonFeaturedCollections) {
            const currentProductIds = collection.productIds;
            const currentProductIndex = collectionIndices[collection.id] || 0;

            if (currentProductIndex < currentProductIds.length) {
                const productId = currentProductIds[currentProductIndex];
                const product = productMap.get(productId);
                
                if (product && !featuredProducts.includes(product)) {
                    featuredProducts.push(product);
                    anyNewProductAdded = true;
                    collectionIndices[collection.id] = currentProductIndex + 1;
                    if (featuredProducts.length >= 10) break;
                }
            }
        }

        if (!anyNewProductAdded && featuredProducts.length < 10) {
            // Se nenhuma nova coleção foi encontrada, e ainda não temos 10 produtos
            // Pegue os próximos 10 produtos do json original, mesmo que se repitam
            for (let i = 0; featuredProducts.length < 10 && i < 10; i++) {
                if (products[i]) {
                    if (!featuredProducts.includes(products[i])) {
                        featuredProducts.push(products[i]);
                    }
                }
            }
        }
    }
  }
  
    return featuredProducts;
  };

  const featuredProducts = getFeaturedProducts();

  const primaryProducts = featuredProducts.slice(0, 3);
  const secondaryProducts = featuredProducts.slice(3, 10);
  
  return (
    <div className="mx-auto max-w-7xl px-[10px] w-[100vw]">
      <div className="relative h-[60vh] md:h-[75vh] flex items-center justify-center text-center border-2 border-slate-800">
        <Image
          src="/hero_handcrafted_heaven.png"
          alt="Hero background image with handmade products"
          fill
          priority={true}
          className="absolute inset-0 z-0 opacity-90 object-cover"
        />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight [-webkit-text-stroke:2px_black]">
            Handcrafted Heaven
          </h1>
          <Link href="/shop" passHref>
            <button className="w-64 mt-8 px-8 py-3 font-bold rounded-lg shadow-lg hover:bg-red-500 transition-colors duration-300">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
      
      <hr className="my-8 border-brand-900" />
      <h1 className="text-3xl font-bold text-center text-primary-800">Featured Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {primaryProducts.map(product => (
          <Link key={product.id} href={`/product_detail/${product.id}` } passHref>
            <ProductCard 
              key={product.id}
              description={product.description}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          </Link>
        ))}
      </div>
      <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-6 mt-12">
        <div className="col-span-1 row-span-2">
          {secondaryProducts[0] && (
            <Link href={`/product_detail/${secondaryProducts[0].id}`} passHref>
              <ProductCard
                imageUrl={secondaryProducts[0].imageUrl}
                description={secondaryProducts[0].description}
                price={secondaryProducts[0].price}
              />
              </Link>
          )}
        </div>
        {secondaryProducts.slice(1, 4).map(product => (
          <Link key={product.id} href={`/product_detail/${product.id}`} passHref>
            <ProductCard
              key={product.id}
              imageUrl={product.imageUrl}
              description={product.description}
              price={product.price}
            />
          </Link>
        ))}
        {secondaryProducts.slice(4, 7).map(product => (
          <Link key={product.id} href={`/product_detail/${product.id}`} passHref>
            <ProductCard
              key={product.id}
              imageUrl={product.imageUrl}
              description={product.description}
              price={product.price}
            />
          </Link>
        ))}
      </div>

      <hr className="my-8 border-brand-900" />
      <h2 className="text-3xl font-bold text-center text-black">About Us</h2>
      <div className="flex flex-col lg:flex-row items-center justify-center mt-6 gap-8">
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
            <Image
              src="/handcrafted_about_us.png"
              alt="Hands of a person crafting a ceramic mug on a pottery wheel"
              fill
              className="rounded-lg shadow-lg object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 text-gray-700 p-4">
          <p className="text-lg leading-relaxed">
            Welcome to Handcrafted Heaven, your paradise for artisanal products. Our mission is to celebrate the beauty, uniqueness, and passion hidden in every handmade piece. We believe that a house truly becomes a home when it is filled with objects that tell stories — products created with care, purpose, and the dedication of a skilled artisan.
          </p>
          <br/>
          <p className="text-lg leading-relaxed">
            Founded with the vision of connecting talented creators with people who value authenticity, Handcrafted Heaven is more than just an online store. We are a community that supports independent artists and designers, offering them a platform to share their unique creations with the world. Each item in our collection, from ceramics to textiles and jewelry, is carefully selected for its quality, durability, and exceptional design.
          </p>
          <br/>
          <p className="text-lg leading-relaxed">
            We are committed to sustainability and ethical production. Many of our artisans use recycled or sustainably sourced materials, ensuring that the beauty of our products does not harm our planet. By shopping with us, you are not just acquiring an object; you are investing in a tradition, an art form, and a more conscious future. Join us in discovering the magic of handmade goods and transform your space with the soul of a work of art.
          </p>
        </div>
      </div>
    </div>
  );
}