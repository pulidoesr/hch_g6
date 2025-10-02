import React from 'react';
import { ShoppingCart, Tag, Star } from 'lucide-react';

// Constant simulating data from a database
const SALE_DISCOUNT = '50%';

// Interface to define the types for the Card component props
// We define 'children' as React.ReactNode to accept any valid JSX content.
// We define 'className' and 'title' as strings.
interface CardProps {
    children: React.ReactNode;
    className: string;
    title: string;
}

// Individual component for a card
// Props:
// - children: Card content
// - className: Additional classes for sizing/background styling
// - title: Optional title for accessibility and soft background contrast
const Card = ({ children, className, title }: CardProps) => (
    <div
        // ADJUSTMENT: Removed 'text-white' from the Card component base class
        className={`relative p-6 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-center ${className}`}
        aria-label={title || "Offer Card"}
        // Simulates a very soft background image using a gradient and a low-opacity placeholder image
        style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
        }}
    >
        {/* Layer for the "very soft background image" - ensures contrast */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-10" 
            style={{ backgroundImage: "url('https://placehold.co/1200x800/222d3b/94a3b8?text=Fundo+Suave')" }}
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
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-inter">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Destaques e Ofertas da Semana
            </h1>
            
            {/* Main GRID (Desktop/Tablet Landscape): 
                - lg:flex-row: On large screens (1024px+), aligns in a row (horizontal).
                - flex-col: On small screens, stacks in a column (vertical).
                - lg:h-[600px]: Fixed height for large screens so that the 2/3 and 1/3 proportions are visible. 
            */}
            <div className="flex flex-col lg:flex-row gap-4 lg:h-[600px] max-w-6xl mx-auto">
                
                {/* Left Section (Cards 1 and 2): 2/3 of the width on desktop 
                */}
                <div className="flex flex-col gap-4 w-full lg:w-2/3 h-full">
                    
                    {/* Card 1: On Going Sale - Occupies 2/3 of the height in the left section (desktop) 
                    */}
                    <Card 
                        title="Em Saldo Contínuo"
                        className="h-96 lg:h-2/3 bg-blue-700/80 justify-end"
                    >
                        <Tag className="w-12 h-12 text-pink-400 mb-4 mx-auto lg:mx-0" />
                        {/* Card 1 H2: Ensured text-white */}
                        <h2 className="text-5xl font-extrabold mb-2 text-center lg:text-left">
                            <span className="text-white">On Going Sale</span>
                        </h2>
                        {/* Card 1 P: Ensured text-white */}
                        <p className="text-7xl font-black text-white mb-6 text-center lg:text-left">
                            {SALE_DISCOUNT} Off.
                        </p>
                        <button className="w-full lg:w-fit px-8 py-3 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:bg-pink-600 transition duration-300 self-center lg:self-start">
                            Browse Products
                        </button>
                    </Card>

                    {/* Card 2: Other Offers - Occupies 1/3 of the height in the left section (desktop) 
                    */}
                    <Card 
                        title="Other Offers"
                        className="h-48 lg:h-1/3 bg-green-700/80 flex flex-row items-center justify-between p-8"
                    >
                        <div className="flex items-center space-x-3">
                            <Star className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                            {/* Card 2 H2: Ensured text-white */}
                            <h2 className="text-5xl font-bold">
                                <span className="text-white">Other Offers</span>
                            </h2>
                        </div>
                        <button className="flex-shrink-0 px-6 py-2 bg-white text-gray-800 font-medium rounded-full hover:bg-gray-100 transition duration-300">
                            Read More
                        </button>
                    </Card>

                </div>

                {/* Card 3: Best Selling Products - Occupies 1/3 of the width and 100% of the main component height (desktop) 
                */}
                <div className="w-full lg:w-1/3 h-full">
                    <Card 
                        title="Best Selling Products"
                        className="h-full bg-red-700/80 flex flex-col items-center justify-center p-8"
                    >
                        <ShoppingCart className="w-16 h-16 text-white mb-4" />
                        {/* Card 3 H2: Ensured text-white */}
                        <h2 className="text-4xl font-extrabold text-center mb-6 ">
                            <span className=  "text-white">Best Selling Products</span>
                        </h2>
                        <p className="text-lg text-gray-200 text-center mb-8">
                            Discover our customers' favorites and the hottest new arrivals of the month.
                        </p>
                        <button className="px-10 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full shadow-xl hover:bg-yellow-500 transition duration-300">
                            Explore
                        </button>
                    </Card>
                </div>

            </div>
        </div>
    );
}

export default OfferCards;
