import React from 'react';
import FeaturedProductGallery from './FeaturedProductCardGallery';

import { getAllProducts } from '@/lib/server/actions/data_bridge';

/**
 * Server Component responsible for loading the complete product data
 * and passing it to the Client Component for randomization.
 */
export default async function FeaturedProductsSection() {
    
    // Loads all data
    const allProducts = getAllProducts();

    // Passes the COMPLETE product list. Thanks to the typing in the Client,

    return (
        <FeaturedProductGallery allProducts={allProducts} />
    );
}
