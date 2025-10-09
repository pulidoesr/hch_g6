// app/seller/products/[id]/page.tsx
// Server Component - Carrega um único produto por ID.

import { getProductById } from '@/lib/server/actions/data_bridge'; 
import ProductEditor from '@/components/ProductEditor/ProductEditor'; 
import { notFound } from 'next/navigation';

interface ProductEditPageProps {
    params: {
        id: string; // ID do produto vindo da URL
    };
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
    
    const productId = params.id;
    
    // 🟢 Usa a função centralizada getProductById
    const product = getProductById(productId);

    if (!product) {
        // Se o produto não for encontrado, exibe a página 404
        notFound(); 
    }

    // Passa o produto completo para o Client Component
    return (
        <ProductEditor 
            key={product.id} // Força o re-mount se o ID mudar
            initialProduct={product} 
            isNew={false} 
        />
    );
}