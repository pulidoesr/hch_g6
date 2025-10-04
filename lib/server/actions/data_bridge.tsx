import Products from '@/data/products.json';

// Import individual types
import { Product, CategoryData, ShippingOption, FullDataSource } from '@/lib/types/product-data';

// --- CORREÇÃO DA IMPORTAÇÃO JSON ---
// 1. Criamos um candidato a rawData.
// 2. Usamos (Products as any).default se for definido (lidando com o embrulho do bundler),
//    caso contrário, usamos o próprio Products.
const rawDataCandidate = (Products as any).default || Products;

// 3. Tipamos o candidato a rawData com a estrutura FullDataSource.
// Isso garante que 'rawData' é o conteúdo real do seu JSON.
const rawData = rawDataCandidate as FullDataSource;
// ------------------------------------


/**
 * Returns all products ('products' section of the JSON).
 * @returns {Product[]} A list of products.
 */
export function getAllProducts(): Product[] {
    return rawData.products;
}

/**
 * Returns collections/categories data ('collections' section of the JSON).
 * @returns {CategoryData[]} A list of category data.
 */
export function getCategoriesData(): CategoryData[] {
    return rawData.collections;
}

/**
 * Returns the list of countries ('countries' section of the JSON).
 * @returns {string[]} A list of country names.
 */
export function getCountriesList(): string[] {
    // Access the 'countries' property from the raw JSON data.
    return rawData.countries;
}

/**
 * Returns the available shipping options, now as an array of detailed objects.
 * @returns {ShippingOption[]} A list of detailed shipping option objects.
 */
export function getShippingOptions(): ShippingOption[] {
    // CORRECTED: The return type now matches the new interface.
    return rawData.shipping_options;
}
