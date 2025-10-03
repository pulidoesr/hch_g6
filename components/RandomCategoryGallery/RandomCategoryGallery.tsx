"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";


interface CategoryItem { 
  name: string;
  imagePath: string;
}

/**
 * Utility function to select 'count' random and unique items from an array.
 * This function MUST run only on the client because it uses Math.random().
 */
function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.slice();
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, Math.min(count, arr.length));
}

// 💡 AJUSTE 1: A prop allCategories agora é opcional ({ allCategories?: CategoryItem[] })
export default function RandomCategoryGallery({ allCategories }: { allCategories?: CategoryItem[] }) {
  
  // 💡 AJUSTE 2: Garantia defensiva. Se allCategories for undefined, use um array vazio.
  const safeCategories = allCategories || [];
  
// ----------------------------------------------------
// HOOKS (ALL AT THE TOP AND ALWAYS IN THE SAME ORDER)
// ----------------------------------------------------
  
  // O estado inicial é [], garantindo que Servidor e Cliente concordem.
  const [randomCategories, setRandomCategories] = useState<CategoryItem[]>([]);
  
  // Combobox States: Initializing searchTerm to an empty string to avoid pre-filtering.
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Ref to close the dropdown when clicking outside
  const comboboxRef = useRef<HTMLDivElement>(null);

  const COUNT = 6;

  // 💡 AJUSTE 3: O useEffect agora usa safeCategories e continua sendo o ponto de randomização.
  // Ele só roda no cliente, após a hidratação.
  useEffect(() => {
    if (safeCategories.length > 0) {
        const selected = getRandomItems(safeCategories, COUNT);
        setRandomCategories(selected);
    }
  }, [safeCategories]); // Dependência atualizada para safeCategories
  
  // Effect to close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 🐛 CORREÇÃO: Falta de parênteses e erro de digitação no nome da função removida.
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [comboboxRef]);

  // Filtering Logic (useMemo MUST be called before theç conditional return)
  // 💡 AJUSTE 4: Usa safeCategories para a lógica de filtragem, evitando o TypeError.
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return safeCategories;
    
    const term = searchTerm.toLowerCase();
    
    return safeCategories.filter(category => 
        category.name.toLowerCase().includes(term)
    );
  }, [searchTerm, safeCategories]); // Dependência atualizada

  // Renderização condicional
  if (randomCategories.length === 0) {
    // 💡 AJUSTE 5: Usa safeCategories para o bloco de carregamento, evitando o TypeError.
    if (safeCategories.length < COUNT) {
        return <div className="text-center p-4 text-red-600">Error: Only {safeCategories.length} categories found. A minimum of {COUNT} is required.</div>
    }
    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900">
                Explore Our Categories
            </h2>
            <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner animate-pulse">
                <div className="text-gray-600 font-medium">Carregando categorias aleatórias...</div>
            </div>
        </div>
    );
  }
  
  // Function to handle category selection
  const handleSelectCategory = (categoryName: string) => {
    setSearchTerm(categoryName);
    setIsOpen(false);
    console.log(`Selected category: ${categoryName}`);
    // Add logic here to filter products or navigate
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900">
        Explore Our Categories
      </h2>
      
      {/* Grid with 6 columns for large screens, maintaining responsiveness */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:gap-8 mb-12">
        {randomCategories.map((category, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center group cursor-pointer transition duration-300 transform hover:scale-105"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg">
              <img 
                src={category.imagePath}
                alt={`Image of Category ${category.name}`}
                className="w-full h-full object-cover"
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </div>
            
            {/* Category Name */}
            <p className="mt-4 text-center text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {category.name}
            </p>
          </div>
        ))}
      </div>
      
      {/* --- Combobox / Filterable Input --- */}
      <div className="my-8 relative" ref={comboboxRef}> 
        <label htmlFor="category-input" className="block text-lg font-medium text-gray-700 mb-2">
          Select or Search for a Category:
        </label>
        
        {/* Input Field */}
        <div className="relative">
            <input
                id="category-input"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true); // Open the list when typing
                }}
                onFocus={() => setIsOpen(true)} // Open the list on focus
                // Updated placeholder text as requested
                placeholder="Select or type the category you desire"
                className="block w-full pl-4 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm border"
            />
            {/* Dropdown icon (for manual click) */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
                {/* Chevron Icon (Tailwind Heroicons) */}
                <svg className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* Dropdown List */}
        {isOpen && (
            <div className="absolute z-10 w-full bg-white shadow-lg mt-1 rounded-md max-h-60 overflow-auto ring-1 ring-black ring-opacity-5">
                <ul className="py-1">
                    {/* Show all categories if search is empty, otherwise show filtered */}
                    {/* 💡 AJUSTE 6: Usa safeCategories para a renderização da lista */}
                    {(searchTerm ? filteredCategories : safeCategories).length > 0 ? (
                        (searchTerm ? filteredCategories : safeCategories).map((category) => (
                            <li
                                key={category.name}
                                onClick={() => handleSelectCategory(category.name)}
                                className={`cursor-pointer select-none relative py-2 pl-4 pr-9 ${
                                    category.name === searchTerm ? 'bg-blue-500 text-white' : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {category.name}
                            </li>
                        ))
                    ) : (
                        <li className="py-2 pl-4 text-gray-500">
                            No categories found.
                        </li>
                    )}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}
