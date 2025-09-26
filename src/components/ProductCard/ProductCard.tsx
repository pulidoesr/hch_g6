// components/ProductCard.tsx
import Image from 'next/image';

interface ProductCardProps {
  imageUrl: string;
  description: string;
  price: number;
  url_external?: string;
}

export default function ProductCard({
  imageUrl,
  description,
  price,
}: ProductCardProps) {
  return (
    <div
      className="block w-full h-full bg-white rounded-lg shadow hover:shadow-md overflow-hidden"
    >
      {/* Imagem do Produto */}
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={description}
          fill
          className="object-cover"
        />
      </div>

      {/* Conteúdo do Cartão */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-gray-700 text-base">{description}</p>
        <p className="text-xl font-bold text-gray-900 mt-auto">
          R$ {price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}