// components/ProductListItem/ProductListItem.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types/product-data'; // Assumindo este tipo
import Button from '@/components/Button/Button';

interface ProductListItemProps {
    product: Product;
}

export default function ProductListItem({ product }: ProductListItemProps) {
    
    const editUrl = `/seller/products/${product.id}`;
    // Assume que a URL da imagem é a primeira do array 'imageUrls'
    const imageUrl = product.imageUrl ? product.imageUrls[0] : '/default_product.png';

    return (
        <div className="flex items-center bg-white shadow-lg rounded-xl p-4 transition hover:shadow-xl hover:ring-2 hover:ring-indigo-100">
            
            {/* Imagem (50px x 50px) - Usa a API moderna com fill e sizes */}
            <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill={true}
                    sizes="50px"
                    className="rounded-lg object-cover"
                />
            </div>

            {/* Nome e Preço */}
            <div className="flex-grow min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                    Preço: R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
            </div>

            {/* Botão de Edição */}
            <Link href={editUrl} passHref className="ml-4 flex-shrink-0">
                <Button variant="secondary" className="px-4 py-2 text-sm">
                    Edit
                </Button>
            </Link>
        </div>
    );
}