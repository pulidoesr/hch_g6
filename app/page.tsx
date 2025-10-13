// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard/ProductCard";
import { getHomeFeaturedProducts } from "@/lib/repositories/products";
import InspirationSection from "@/components/InspirationSection/InspirationSection";
import RandomCategoryGallery from "@/components/RandomCategoryGallery/RandomCategoryGallery";
import { getAllProducts, getCategoriesData } from "@/lib/server/actions/data_bridge";

export const revalidate = 60;

export default async function Page() {
  // Fetch data on the server
  const [featuredProducts, products, categoriesRaw] = await Promise.all([
    getHomeFeaturedProducts(10),
    getAllProducts(),
    getCategoriesData(),
  ]);

  // Featured splits used below
  const primaryProducts = featuredProducts.slice(0, 3);
  const secondaryProducts = featuredProducts.slice(3, 10);

  // Map categories to the shape RandomCategoryGallery expects
  // (CategoryItem: { id: number; name: string; imagePath: string })
  const categories = (categoriesRaw ?? []).map((c: any) => ({
    id: Number(c.id ?? c.collectionId ?? 0),
    name: c.name ?? c.title ?? "Untitled",
    imagePath: c.image_path ?? c.imagePath ?? "/placeholder-category.jpg",
  }));

  return (
    <div className="mx-auto max-w-7xl px-[10px] w-[100vw]">
      {/* Hero */}
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

      {/* Top 3 featured */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {primaryProducts.map((product) => (
          <Link key={product.id} href={`/product_detail/${product.id}`}>
            <ProductCard
              description={product.description}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          </Link>
        ))}
      </div>

      {/* Secondary featured */}
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

        {secondaryProducts.slice(1, 4).map((product) => (
          <Link key={product.id} href={`/product_detail/${product.id}`}>
            <ProductCard
              imageUrl={product.imageUrl}
              description={product.description}
              price={product.price}
            />
          </Link>
        ))}

        {secondaryProducts.slice(4, 7).map((product) => (
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
