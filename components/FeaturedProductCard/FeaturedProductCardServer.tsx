import Products from '@/data/products.json';

import { Product } from '@/lib/types/product-data';

export function getAllProducts(): Product[] {
    const rawData = Products as { products: Product[] };
    return rawData.products;
}