// app/page.tsx
import { auth } from "@/auth";
import Image from 'next/image';
import { loadSellerData } from '@/lib/server/actions/data_bridge'; 
import { Seller, Product } from '@/lib/types/product-data'; 
import AdminProductCard from '@/components/AdminProductCard/AdminProductCard';
import Button from '@/components/Button/Button';
import Link from 'next/link';


export default async function SellerDashboard() {
  
const session = await auth();
    const sellerId = (session?.user as any)?.sellerId;

    if (!sellerId) {
    return (
        <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
        <p>This account isn’t linked to a seller.</p>
        </div>
    );
    }
  const { seller, products }: { seller: Seller; products: Product[]; } = 
    await loadSellerData(sellerId);
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* ... o restante do seu código JSX ... */}
      <div className="max-w-7xl mx-auto">
        
        {/* 1. SEÇÃO DO VENDEDOR (TOPO) */}
        <header className="relative text-center pb-8">
          
          <div className="absolute top-0 right-0">
            <Button variant="primary" className="text-xs px-3 py-3 flex-1">Save All Changes</Button>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 pt-12">
            {seller.name}
          </h1>

          <div className="mx-auto w-32 h-32 md:w-40 md:h-40 relative">
            <Image
              src={seller.photoUrl} 
              alt={`Foto de perfil de ${seller.name}`}
              fill={true}
              sizes="(min-width: 768px) 160px, 128px"
              className="rounded-full border-4 border-white shadow-xl object-cover" 
            />
          </div>
          
        </header>

        <hr className="my-8 border-gray-300" />
        
        {/* 2. SEÇÃO ABOUT ME */}
        <section className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">About Me</h2>
          
          <div className="max-w-4xl mx-auto px-4">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none text-gray-700"
              rows={6}
              defaultValue={seller.aboutMeText}
              placeholder="Fale um pouco sobre você e sua arte..."
              readOnly
            />
          </div>
        </section>

        <hr className="my-10 border-gray-300" />

        {/* 3. SEÇÃO MY COLLECTION */}
        <section className="mt-10">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center md:text-left md:w-full">
              My Collection ({seller.collectionName})
            </h2>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-3 mt-4 md:mt-0">
              <Link href="/seller/create_product">
                <Button variant="primary" className="text-xs px-2 py-1 flex-1">Add Product</Button>
              </Link>
        
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 p-4">
            {products.map(product => (
              <AdminProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-end mt-12 mb-8 p-4">
            <Button variant="primary" className="w-full md:w-auto">
              Save All Changes
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}