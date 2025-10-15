'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types/product-data';
import Button from '@/components/Button/Button';

interface AdminProductCardProps {
  product: Product;
}

export default function AdminProductCard({ product }: AdminProductCardProps) {
  
  // 🎯 Define a URL de destino dinâmica
  const editUrl = `/seller/products/${product.id}`;
  
  return (
    <div
      className="flex flex-col border border-gray-200 rounded-xl shadow-lg overflow-hidden p-4 bg-white"
    >
      {/* Imagem do Produto */}
      <div className="relative w-full h-48 mb-3">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill={true}
          sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="rounded-lg object-contain"
        />
      </div>

      <div className="flex-grow flex flex-col gap-2">
        {/* Nome do Produto (NOVO) */}
        <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>

        {/* Preço */}
        <p className="text-xl font-bold text-indigo-600">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        
        {/* Checkbox "Display on market place" (NOVO REQUISITO) */}
        <div className="flex items-center mt-2 mb-3">
          <input
            id={`checkbox-${product.id}`}
            name="display_on_marketplace"
            type="checkbox"
            checked={product.displayOnMarketplace}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            onChange={() => console.log('Toggle display')}
          />
          <label htmlFor={`checkbox-${product.id}`} className="ml-2 block text-sm text-gray-700 select-none">
            Display on market place
          </label>
        </div>

        {/* Descrição do Produto (Requisito da tela de vendedor) */}
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
            {product.description}
        </p>
      </div>
      
      {/* 🟢 BOTÕES DE AÇÃO 🟢 */}
      <div className="mt-4 flex gap-2"> 
        
        {/* CORREÇÃO: Envolvemos o botão "Edit" com Link */}
        <Link href={editUrl}>
          <Button variant="secondary" className="text-xs w-40 px-2 py-1">
            Edit
          </Button> 
        </Link>
        
        {/* O botão Delete permanece como um Button simples (para uma ação sem navegação) */}
        <Button variant="delete" className="text-xs w-640 px-2 py-1">
          Delete
        </Button>
      </div>
    </div>
  );
}