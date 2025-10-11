"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

interface CategoryItem { 
  id: number;          
  name: string;
  imagePath: string;
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, arr.length));
}

export default function RandomCategoryGallery({ allCategories }: { allCategories?: CategoryItem[] }) {
  const router = useRouter();
  const safeCategories = useMemo(() => allCategories || [], [allCategories]);
  const [randomCategories, setRandomCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const COUNT = 6;

  useEffect(() => {
    if (safeCategories.length > 0) {
      const selected = getRandomItems(safeCategories, COUNT);
      setRandomCategories(selected);
    }
  }, [safeCategories]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [comboboxRef]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return safeCategories;
    const term = searchTerm.toLowerCase();
    return safeCategories.filter(category => 
      category.name.toLowerCase().includes(term)
    );
  }, [searchTerm, safeCategories]);

  const handleSelectCategory = (categoryId: number, categoryName: string) => {
    setSearchTerm(categoryName);
    setIsOpen(false);
    router.push(`/products?categoryId=${encodeURIComponent(categoryId)}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900">
        Explore Our Categories
      </h2>

      {/* Grade de categorias */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:gap-8 mb-12">
        {randomCategories.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center group cursor-pointer transition duration-300 transform hover:scale-105"
            onClick={() => handleSelectCategory(category.id, category.name)} // ✅ passa o id
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg">
              <img
                src={category.imagePath}
                alt={`Image of Category ${category.name}`}
                className="w-full h-full object-cover"
                style={{ backgroundColor: "#f0f0f0" }}
              />
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {category.name}
            </p>
          </div>
        ))}
      </div>

      {/* Dropdown */}
      <div className="my-8 relative" ref={comboboxRef}>
        <label htmlFor="category-input" className="block text-lg font-medium text-gray-700 mb-2">
          Select or Search for a Category:
        </label>

        <div className="relative">
          <input
            id="category-input"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Select or type the category you desire"
            className="block w-full pl-4 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm border"
          />
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full bg-white shadow-lg mt-1 rounded-md max-h-60 overflow-auto ring-1 ring-black ring-opacity-5">
            <ul className="py-1">
              {(searchTerm ? filteredCategories : safeCategories).map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id, category.name)} // ✅ usa id
                  className={`cursor-pointer select-none relative py-2 pl-4 pr-9 ${
                    category.name === searchTerm
                      ? "bg-blue-500 text-white"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}