// components/ImageGallery.jsx
'use client';

import Image from 'next/image';
import { type ChangeEvent } from 'react';

// 1. Defina o tipo de um único item da coleção
interface CollectionItem {
  id: number;
  name: string;
  isFeatured: boolean;
  story: string;
  imagePath?: string; // Adicionamos a propriedade opcional
}

// 2. Defina o tipo para as props do componente ImageGallery
interface ImageGalleryProps {
  collections: CollectionItem[];
  selectedCollection: string;
  setSelectedCollection: (collectionName: string) => void;
}

// 3. Aplique a tipagem nas props
export default function ImageGallery({ collections, selectedCollection, setSelectedCollection }: ImageGalleryProps) {

  const handleClearFilter = () => {
    setSelectedCollection('');
  };

  const handleClickImage = (collectionName: string) => {
    setSelectedCollection(collectionName);
  };

  // Filtra as coleções em destaque para a seção de imagens
  const featuredCollections = collections.filter(collection => collection.isFeatured);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-center gap-4">
        {featuredCollections.map((collection) => (
          <div 
            key={collection.id}
            onClick={() => handleClickImage(collection.name)} 
            className="flex-1 min-w-[180px] relative h-[180px] rounded-lg overflow-hidden shadow-lg cursor-pointer"
          >
            <Image
              src={collection.imagePath || '/path/to/default/image.png'} // Usa imagePath diretamente
              alt={`${collection.name} collection`}
              fill
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl md:text-2xl font-semibold text-[#3A3A99]">Choose your favorite artisan</h2>
        <div className="relative w-full md:w-1/2">
          <input
            list="collections-list"
            id="collections-input"
            name="collections-input"
            value={selectedCollection}
            onInput={(e: ChangeEvent<HTMLInputElement>) => setSelectedCollection(e.target.value)}
            placeholder="Search for a collection..."
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-200 focus:outline-none"
          />
          {selectedCollection && (
            <button
              onClick={handleClearFilter}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <datalist id="collections-list">
            {collections.map((collection) => (
              <option key={collection.id} value={collection.name} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}