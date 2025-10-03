"use client";
import React, { useMemo } from 'react';
import { Star, Heart } from 'lucide-react';

// Import Product interface from the Server Wrapper to ensure consistent typing
import { Product } from "./InspirationSectionWrapper";

// Define the expected props for this Client Component
interface InspirationSectionProps {
    productsData: Product[];
}

// Auxiliary component for rendering a single product card
const ProductCard = ({ product }: { product: Product }) => {
    // Placeholder URL for navigation (simulating a link with ID)
    const productDetailUrl = `/product-detail?id=${product.id}`;
    
    return (
        <a href={productDetailUrl} className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 bg-white">
            <div className="relative aspect-w-4 aspect-h-3 sm:aspect-h-4 overflow-hidden">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x250/222d3b/ffffff?text=Product'; }}
                />
                <div className="absolute top-2 right-2 p-1 bg-white/70 backdrop-blur-sm rounded-full text-yellow-500 flex items-center text-sm font-semibold">
                    {/* Display Rating */}
                    <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                    {product.rating ? product.rating.toFixed(1) : 'N/A'}
                </div>
                <div className="absolute bottom-0 right-0 p-2 text-white bg-black/60 rounded-tl-xl">
                    <Heart className="w-5 h-5 opacity-80" />
                </div>
            </div>
            
            <div className="p-3 text-gray-800">
                <h3 className="text-base font-semibold truncate group-hover:text-blue-600 transition duration-300">
                    {product.name}
                </h3>
                <p className="text-lg font-bold text-red-600 mt-1">
                    ${product.price ? product.price.toFixed(2) : 'N/A'}
                </p>
            </div>
        </a>
    );
};

// --- MAIN COMPONENT: Inspiration Section (Client Component) ---
const InspirationSection = ({ productsData }: InspirationSectionProps) => {

    // 1. Logic to filter and select 6 featured products randomly
    const selectedProducts = useMemo(() => {
        // Ensuring 'productsData' has been loaded
        if (!productsData || productsData.length === 0) return [];
        
        // Filter: isFeatured = true AND rating >= 4.0
        const filtered = productsData.filter(p => p.isFeatured && p.rating && p.rating >= 4.0);

        // Random Selection Logic (Fisher-Yates shuffle variant)
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Take the first 6 elements
        return shuffled.slice(0, 6);
    }, [productsData]); // Dependency on productsData to recalculate after initial load

    const inspirationText = "The highest rated creations are made by those who dare to dream. Explore our featured collection and find the perfect spark for your next masterpiece.";

    // No loading state needed, as data is provided by the Server Component
    
    return (
        <section className="mt-4 py-10 bg-white rounded-2xl shadow-xl max-w-6xl mx-auto">
            <div className="px-4 sm:px-8">
                {/* Title */}
                <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
                    Inspiration
                </h2>
                {/* Inspiring Text */}
                <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto mb-10">
                    {inspirationText}
                </p>

                {/* Grid of 6 Products */}
                {selectedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {selectedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 p-8">No featured products currently available or loaded.</p>
                )}
            </div>
        </section>
    );
};

export default InspirationSection;
