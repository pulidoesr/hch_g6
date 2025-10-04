import Products from '@/data/products.json';

// Import individual types, ensuring ShippingOption is included.
import { Product, CategoryData, ShippingOption, FullDataSource } from '@/lib/types/product-data';

// This ensures 'rawData' has the expected structure.
const rawData = Products as FullDataSource;

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
