// src/components/CuratedCollection.jsx
import React from 'react';
import Image from 'next/image'

type ImageItem = {
  id: string | number;
  url: string;
  name: string;
};

type CuratedCollectionProps = {
  images: ImageItem[];
};

const CuratedCollection: React.FC<CuratedCollectionProps> = ({ images }) => {
  // Adiciona uma verificação para garantir que o array de imagens não esteja vazio
  if (!images || images.length === 0) {
    return <p>No collections found.</p>;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Título da Coleção */}
      <h1 className="text-3xl font-bold text-left mb-4">
        Curated Collection
      </h1>

      {/* Descrição da Coleção */}
      <p className="text-lg text-left mb-8 text-gray-700">
        Discover our exclusive collection of handcrafted products, carefully selected for you.
      </p>

      {/* Galeria de Imagens Responsiva */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {images.map(image => (
          <div key={image.id} className="flex flex-col items-center">
            <Image 
              src={image.url} 
              alt={image.name} 
              className="w-full h-auto rounded-lg shadow-md" 
              width={180}
              height={180}
            />
            <p className="mt-2 text-center text-sm font-medium text-gray-800">
              {image.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CuratedCollection;