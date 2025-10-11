'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

type CategoryItem = {
  id: number;
  name: string;
  imagePath: string;
};

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, arr.length));
}

export default function RandomCategoryGallery({
  allCategories = [],
}: {
  allCategories?: CategoryItem[] | unknown;
}) {
  const router = useRouter();

  // Coerce to a real array
  const safeCategories: CategoryItem[] = useMemo(
    () => (Array.isArray(allCategories) ? (allCategories as CategoryItem[]) : []),
    [allCategories]
  );

  // Stable signature to detect real data changes (prevents infinite loops)
  const catsSig = useMemo(
    () => safeCategories.map((c) => c.id).join(","),
    [safeCategories]
  );

  const [randomCategories, setRandomCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const COUNT = 6;

  useEffect(() => {
    // Only regenerate when the underlying *content* changes (ids)
    if (safeCategories.length > 0) {
      setRandomCategories(getRandomItems(safeCategories, COUNT));
    } else {
      setRandomCategories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catsSig]); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return safeCategories;
    const term = searchTerm.toLowerCase();
    return safeCategories.filter((c) => c.name.toLowerCase().includes(term));
  }, [searchTerm, safeCategories]);

  const handleSelectCategory = (categoryId: number, categoryName: string) => {
    setSearchTerm(categoryName);
    setIsOpen(false);
    router.push(`/products?categoryId=${encodeURIComponent(String(categoryId))}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900">
        Explore Our Categories
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:gap-8 mb-12">
        {randomCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleSelectCategory(category.id, category.name)}
            className="flex flex-col items-center group cursor-pointer transition duration-300 transform hover:scale-105"
            aria-label={`View ${category.name} category`}
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-lg">
              <img
                src={category.imagePath || "/placeholder.png"}
                alt={`Image of Category ${category.name}`}
                className="w-full h-full object-cover"
                style={{ backgroundColor: "#f0f0f0" }}
              />
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {category.name}
            </p>
          </button>
        ))}
      </div>

      
      <div className="my-8 relative" ref={comboboxRef}>
        <label htmlFor="category-input" className="block text-lg font-medium text-gray-700 mb-2">
          Select or Search for a Category:
        </label>
        <div className="relative">
          <input
            id="category-input"
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Select or type the category you desire"
            className="block w-full pl-4 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm border"
            aria-autocomplete="list"
            aria-controls="category-combobox-list"
            // aria-expanded={isOpen}
            // role="combobox"
          />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            aria-label={isOpen ? "Collapse category list" : "Expand category list"}
            // aria-expanded={isOpen}
            aria-controls="category-combobox-list"
            title={isOpen ? "Collapse" : "Expand"}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
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
          <div
            className="absolute z-10 w-full bg-white shadow-lg mt-1 rounded-md max-h-60 overflow-auto ring-1 ring-black ring-opacity-5"
            // role is intentionally omitted on this wrapper
          >
      
            <ul id="category-combobox-list" role="listbox" className="py-1">
              {(searchTerm ? filteredCategories : safeCategories).map((category) => {
                const selected = category.name === searchTerm;
                return (
                  <li
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id, category.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectCategory(category.id, category.name);
                      }
                    }}
                    role="option"
                    // aria-selected={selected} 
                    tabIndex={-1}
                    className={`cursor-pointer select-none relative py-2 pl-4 pr-9 ${
                      selected ? "bg-blue-500 text-white" : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </li>
                );
             })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
