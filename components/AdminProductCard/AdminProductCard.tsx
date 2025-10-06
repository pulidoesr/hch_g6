// components/AdminProductCard/AdminProductCard.tsx
'use client'

import Image from 'next/image';
import { Product } from '@/lib/types/product-data';
import Button from '@/components/Button/Button';

interface AdminProductCardProps {
  product: Product;
}

export default function AdminProductCard({ product }: AdminProductCardProps) {
  // Ajuste de classes para garantir que o card caiba no grid
  return (
    <div
      className="flex flex-col border border-gray-200 rounded-xl shadow-lg overflow-hidden p-4 bg-white"
    >
      {/* Imagem do Produto */}
      <div className="relative w-full h-48 mb-3">
        <Image
          src={product.imageUrl}
          alt={product.name}
          layout="fill"
          objectFit="contain" // Melhor para produtos, evitando cortes
          className="rounded-lg"
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
      
      {/* 🟢 BOTÕES DE AÇÃO (REATIVADOS E CORRIGIDOS) 🟢 */}
      <div className="mt-4 flex gap-2"> 
        {/* Usamos flex e gap-2 no pai para espaçamento */}
          
        {/* Adicionamos w-full para garantir que cada botão ocupe 100% do espaço disponível em sua coluna flex */}
        <Button variant="secondary" className="text-xs w-full px-2 py-1">Edit</Button> 
        <Button variant="delete" className="text-xs w-full px-2 py-1">Delete</Button>
      </div>
    </div>
  );
}