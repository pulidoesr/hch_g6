"use client";

import React from 'react';
import { ShoppingCart, Tag, Star } from 'lucide-react';
// CORREÇÃO: O import 'next/navigation' foi removido para evitar o erro de compilação.
// A navegação agora é tratada diretamente via window.location.href.

// Constant simulating data from a database
const SALE_DISCOUNT = '50%';

// Placeholder URL for background (using a tiny transparent PNG)
const ONGOING_SALE_BG_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='; 

// Interface to define the types for the Card component props
interface CardProps {
    children: React.ReactNode;
    className: string;
    title: string;
    bgImageUrl?: string; 
}

// Individual component for a card
const Card = ({ children, className, title, bgImageUrl }: CardProps) => (
    <div
        className={`relative p-6 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-center ${className}`}
        aria-label={title || "Offer Card"}
        style={{
            background: 'linear-gradient(135deg, rgba(10, 15, 25, 1.0) 0%, rgba(20, 30, 40, 1.0) 100%)',
        }}
    >
        {/* Layer for the soft background image */}
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
                backgroundImage: `url('${bgImageUrl}')`,
                opacity: 0.2
            }}
            aria-hidden="true" 
        ></div>
        {/* Card Content */}
        <div className="relative z-10 text-white">
            {children}
        </div>
    </div>
);

// Main Component for Next.js
const OfferCards = () => {
    // CORREÇÃO: useRouter foi removido.

    // 🟢 Função para lidar com o clique e navegar para /products?filter=sale
    const handleBrowseSale = () => {
        // Usa navegação direta para contornar a restrição de ambiente.
        window.location.href = '/products?filter=sale';
    };
    
    // 🟢 Função para lidar com o clique e navegar para /products?filter=bestseller
    const handleBrowseBestsellers = () => {
        // Usa navegação direta para contornar a restrição de ambiente.
        window.location.href = '/products?filter=bestseller';
    };

    // 🟢 NOVO: Função para lidar com o clique e navegar para /products?filter=new
    const handleBrowseNew = () => {
        // Usa navegação direta para contornar a restrição de ambiente.
        window.location.href = '/products?filter=new';
    };

    return (
        <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-6 font-inter">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Highlights and Offers of the Week
            </h1>
            
            <div className="flex flex-col lg:flex-row gap-4 lg:h-[450px] max-w-6xl mx-auto">
                
                <div className="flex flex-col gap-4 w-full lg:w-2/3 h-full">
                    
                    {/* Card 1: On Going Sale */}
                    <Card 
                        title="On Going Sale"
                        bgImageUrl={ONGOING_SALE_BG_URL}
                        className="h-72 lg:h-2/3 bg-blue-700/80" 
                    >
                        <div className="h-full flex flex-col items-center justify-end"> 
                            <Tag className="w-14 h-14 text-yellow-400 mb-4" />
                            <h2 className="text-5xl font-extrabold mb-2 text-center">
                                <span className="text-white">On Going Sale</span>
                            </h2>
                            <p className="text-7xl font-black text-white mb-6 text-center">
                                {SALE_DISCOUNT} Off.
                            </p>
                            {/* Adicionado o manipulador onClick para 'sale' */}
                            <button 
                                className="w-48 px-8 py-3 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:bg-pink-600 transition duration-300 mx-auto"
                                onClick={handleBrowseSale}
                            >
                                Browse Products
                            </button>
                        </div>
                    </Card>

                    {/* Card 2: Other Offers */}
                    <Card 
                        title="Other Offers" 
                        bgImageUrl={ONGOING_SALE_BG_URL}
                        className="h-48 lg:h-1/3 bg-green-700/80 p-8 flex flex-col justify-center"
                    >
                        <div className="w-full flex flex-col lg:flex-row items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Star className="w-14 h-14 text-yellow-400 flex-shrink-0" />
                                <h2 className="text-5xl font-bold">
                                    <span className="text-white font-extrabold">Other Offers</span>
                                </h2>
                            </div>

                            <button 
                                className="w-48 px-6 py-2 bg-white text-gray-800 font-medium rounded-full hover:bg-gray-100 transition duration-300 mt-4 lg:mt-0 mx-auto lg:mx-0"
                                onClick={handleBrowseNew}
                            >
                                Read More
                            </button>
                        </div>
                    </Card>

                </div>

                {/* Card 3: Best Selling Products */}
                <div className="w-full lg:w-1/3 h-full">
                    <Card 
                        title="Best Selling Products" 
                        bgImageUrl={ONGOING_SALE_BG_URL}
                        className="h-full bg-red-700/80 flex flex-col items-center justify-center p-8"
                    >
                        <div className="flex justify-center w-full">
                            <ShoppingCart className="w-14 h-14 text-yellow-300 mb-4" />
                        </div>
                        
                        <h2 className="text-4xl font-extrabold text-center mb-6">
                            <span className="text-white">Best Selling Products</span>
                        </h2>
                        <p className="text-lg text-gray-200 text-center mb-8">
                            Discover our customers' favorites and the hottest new arrivals of the month.
                        </p>
                        <div className="w-full flex justify-center">
                            <button 
                                className="w-48 px-10 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full shadow-xl hover:bg-yellow-500 transition duration-300"
                                onClick={handleBrowseBestsellers}
                            >
                                Explore
                            </button>
                        </div>
                    </Card>
                </div>

            </div>

        </div>
    );
}

export default OfferCards;
