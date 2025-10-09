// app/seller/products/page.tsx
// Server Component - Carrega a lista de produtos do Seller.

import Link from 'next/link';
import { loadSellerData } from '@/lib/server/actions/data_bridge'; 
import { Product } from '@/lib/types/product-data'; 
import ProductListItem from '@/components/ProductListItem/ProductListItem'; 

// SIMULAÇÃO: O ID do Seller viria da sessão de autenticação.
const FAKE_SELLER_ID = 1; 

export default async function SellerProductsPage() {
    
    // 🟢 Usa a função centralizada loadSellerData
    const { seller, products } = loadSellerData(FAKE_SELLER_ID);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-5">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 md:mb-0">
                    Collection Edit: {seller.collectionName} ({products.length} itens)
                </h1>
                
            </header>

            <div className="space-y-4">
                {products.length === 0 ? (
                    <p className="text-gray-500 text-lg">
                        You have no products in this collection.
                    </p>
                ) : (
                    products.map((product: Product) => (
                        <ProductListItem key={product.id} product={product} />
                    ))
                )}
            </div>
        </div>
    );
}