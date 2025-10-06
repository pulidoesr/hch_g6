// components/AdminProductCard.tsx

import Image from 'next/image';
import { Product } from '@/lib/types/product-data'; // Tipagem do objeto completo
import Button from '@/components/Button/Button'; // Reutilizamos o componente Button

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
            onChange={() => console.log('Toggle display')} // Em um app real, isso mudaria o estado
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
      
      {/* Botões de Ação (Apenas para demonstração, já que o requisito foi movido para o topo da seção My Collection) */}
      {/*
      <div className="mt-auto flex justify-between gap-2">
          <Button variant="secondary" className="text-xs px-2 py-1">Edit</Button>
          <Button variant="delete" className="text-xs px-2 py-1">Delete</Button>
      </div>
      */}
    </div>
  );
}