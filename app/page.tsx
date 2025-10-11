import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard/ProductCard";
import { getHomeFeaturedProducts } from "@/lib/repositories/products";
import InspirationSection from "@/components/InspirationSection/InspirationSection";
import { getAllProducts } from "@/lib/server/actions/data_bridge";

export const revalidate = 60;

export default async function Page() {
  const featuredProducts = await getHomeFeaturedProducts(10);
  const products = await getAllProducts(); // <-- this is an array you’ll pass down

  const primaryProducts = featuredProducts.slice(0, 3);
  const secondaryProducts = featuredProducts.slice(3, 10);

  return (
    <div className="mx-auto max-w-7xl px-[10px] w-[100vw]">
      <div className="relative h-[60vh] md:h-[75vh] flex items-center justify-center text-center border-2 border-slate-800">
        <Image
          src="/hero_handcrafted_heaven.png"
          alt="Hero background image with handmade products"
          fill
          priority
          className="absolute inset-0 z-0 opacity-90 object-cover"
        />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight [-webkit-text-stroke:2px_black]">
            Handcrafted Heaven
          </h1>
          <Link href="/shop">
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
          <Link key={product.id} href={`/product_detail/${product.id}`}>
            <ProductCard
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
            <Link href={`/product_detail/${secondaryProducts[0].id}`}>
              <ProductCard
                imageUrl={secondaryProducts[0].imageUrl}
                description={secondaryProducts[0].description}
                price={secondaryProducts[0].price}
              />
            </Link>
          )}
        </div>

        {secondaryProducts.slice(1, 4).map(product => (
          <Link key={product.id} href={`/product_detail/${product.id}`}>
            <ProductCard
              imageUrl={product.imageUrl}
              description={product.description}
              price={product.price}
            />
          </Link>
        ))}

        {secondaryProducts.slice(4, 7).map(product => (
          <Link key={product.id} href={`/product_detail/${product.id}`}>
            <ProductCard
              imageUrl={product.imageUrl}
              description={product.description}
              price={product.price}
            />
          </Link>
        ))}
      </div>

      <hr className="my-8 border-brand-900" />

      {/* 🔽 Use the products array here */}
      <InspirationSection products={products} />

      {/* About Us … */}
    </div>
  );
}
