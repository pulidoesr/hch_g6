import React from 'react';
import { ShoppingCart, Tag, Star } from 'lucide-react';

// Constant simulating data from a database
const SALE_DISCOUNT = '50%';

const ONGOING_SALE_BG_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='; 

// Interface to define the types for the Card component props
// We define 'children' as React.ReactNode to accept any valid JSX content.
// We define 'className' and 'title' as strings.
interface CardProps {
    children: React.ReactNode;
    className: string;
    title: string;
    bgImageUrl?: string; 
}

// Individual component for a card
// Props:
// - children: Card content
// - className: Additional classes for sizing/background styling
// - title: Optional title for accessibility and soft background contrast
const Card = ({ children, className, title, bgImageUrl }: CardProps) => (
    <div
        // ADJUSTMENT: Removed 'text-white' from the Card component base class
        className={`relative p-6 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-center ${className}`}
        aria-label={title || "Offer Card"}
        // Simulates a very soft background image using a gradient and a low-opacity placeholder image
        style={{
            background: 'linear-gradient(135deg, rgba(10, 15, 25, 1.0) 0%, rgba(20, 30, 40, 1.0) 100%)',
        }}
    >
        {/* Layer for the "very soft background image" - ensures contrast */}
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
                // APLICAÇÃO DA IMAGEM DE FUNDO AQUI
                backgroundImage: `url('${bgImageUrl}')`,
                opacity: 0.2 // Reduz a opacidade para que o texto fique legível
            }}
            aria-hidden="true" 
        ></div>
        {/* Card Content */}
        {/* Added text-white here to ensure all children inherit white color */}
        <div className="relative z-10 text-white">
            {children}
        </div>
    </div>
);

// Main Component for Next.js
const OfferCards = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
            {/* Adjusted main title to be in English for consistency */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Highlights and Offers of the Week
            </h1>
            
            {/* Main GRID (Desktop/Tablet Landscape): 
                - lg:flex-row: On large screens (1024px+), aligns in a row (horizontal).
                - flex-col: On small screens, stacks in a column (vertical).
                - ADJUSTMENT: Fixed height reduced from 600px to 450px to make component more compact.
            */}
            <div className="flex flex-col lg:flex-row gap-4 lg:h-[450px] max-w-6xl mx-auto">
                
                {/* Left Section (Cards 1 and 2): 2/3 of the width on desktop 
                */}
                <div className="flex flex-col gap-4 w-full lg:w-2/3 h-full">
                    
                    {/* Card 1: On Going Sale - Occupies 2/3 of the height in the left section (desktop) 
                        Propriedade bgImageUrl adicionada para usar a nova imagem.
                    */}
                    <Card 
                        title="On Going Sale" // CORRECTED: Translated title to English
                        bgImageUrl={ONGOING_SALE_BG_URL} // Usa a URL Base64
                        // ADJUSTMENT: Mobile height reduced from h-96/h-80 to h-72
                        className="h-72 lg:h-2/3 bg-blue-700/80" 
                    >
                        {/* Wrapper to control alignment inside Card 1 (Centralized) */}
                        <div className="h-full flex flex-col items-center justify-end"> 
                            <Tag className="w-14 h-14 text-yellow-400 mb-4" />
                            {/* Ensured text-center on all screen sizes and restored span */}
                            <h2 className="text-5xl font-extrabold mb-2 text-center">
                                <span className="text-white">On Going Sale</span>
                            </h2>
                            {/* Ensured text-center on all screen sizes */}
                            <p className="text-7xl font-black text-white mb-6 text-center">
                                {SALE_DISCOUNT} Off.
                            </p>
                            {/* ADJUSTMENT: Centered button using mx-auto for robustness and increased width to w-48 */}
                            <button className="w-48 px-8 py-3 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:bg-pink-600 transition duration-300 mx-auto">
                                Browse Products
                            </button>
                        </div>
                    </Card>

                    {/* Card 2: Other Offers - Occupies 1/3 of the height in the left section (desktop) 
                    */}
                    <Card 
                        title="Other Offers" 
                        bgImageUrl={ONGOING_SALE_BG_URL} // Usa a URL Base64
                        // h-48 is maintained as the proportion for 1/3 of the old height, which is appropriate for this 1/3 section
                        className="h-48 lg:h-1/3 bg-green-700/80 p-8 flex flex-col justify-center"
                    >
                        {/* RESTORED DIV: This inner div manages the horizontal/vertical (desktop/mobile) alignment. */}
                        <div className="w-full flex flex-col lg:flex-row items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Star className="w-14 h-14 text-yellow-400 flex-shrink-0" />
                                {/* Card 2 H2: Ensured text-white and restored span */}
                                <h2 className="text-5xl font-bold">
                                    <span className="text-white font-extrabold">Other Offers</span>
                                </h2>
                            </div>
                            {/* ADJUSTMENT: Width increased to w-48 (12rem) for consistency, added responsiveness for positioning */}
                            <button className="w-48 px-6 py-2 bg-white text-gray-800 font-medium rounded-full hover:bg-gray-100 transition duration-300 mt-4 lg:mt-0 mx-auto lg:mx-0">
                                Read More
                            </button>
                        </div>
                    </Card>

                </div>

                {/* Card 3: Best Selling Products - Occupies 1/3 of the width and 100% of the main component height (desktop) 
                */}
                <div className="w-full lg:w-1/3 h-full">
                    <Card 
                        title="Best Selling Products" 
                        bgImageUrl={ONGOING_SALE_BG_URL} // Usa a URL Base64
                        // h-full ensures it takes the new total height of lg:h-[450px]
                        className="h-full bg-red-700/80 flex flex-col items-center justify-center p-8"
                    >
                        <div className="flex justify-center w-full">
                            <ShoppingCart className="w-14 h-14 text-yellow-300 mb-4" />
                        </div>
                        
                        {/* Card 3 H2: Ensured text-white and restored span */}
                        <h2 className="text-4xl font-extrabold text-center mb-6">
                            <span className="text-white">Best Selling Products</span>
                        </h2>
                        <p className="text-lg text-gray-200 text-center mb-8">
                            Discover our customers' favorites and the hottest new arrivals of the month.
                        </p>
                        <div className="w-full flex justify-center">
                            <button className="w-48 px-10 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full shadow-xl hover:bg-yellow-500 transition duration-300">
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
