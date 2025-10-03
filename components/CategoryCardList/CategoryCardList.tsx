

import React from 'react';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  imageSrc: string;
}

interface CategoryCardListProps {
  categories: Category[]; 
}

/**
* Component that displays a list of category cards responsively
* using Tailwind CSS classes.
 * * @param {CategoryCardListProps} props 
 */
const CategoryCardListTailwind: React.FC<CategoryCardListProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return <p className="text-center text-gray-500 py-8">Nenhuma categoria encontrada.</p>;
  }

  return (
    <div className="
        max-w-7xl mx-auto p-4 
        grid grid-cols-2 gap-4 
        md:grid-cols-4 md:gap-6 
        lg:grid-cols-6 lg:gap-8
    ">
      {categories.map((category) => (
        <div 
          key={category.id} 
          className="
            flex flex-col items-center text-center 
            cursor-pointer transform transition duration-300 hover:scale-[1.03]
          "
        >
          {/* Wrapper da Imagem */}
          <div className="
            relative w-full 
            aspect-square 
            overflow-hidden rounded-xl 
            shadow-lg hover:shadow-xl
          ">
            <Image
              src={category.imageSrc}
              alt={category.name}
              fill
              sizes="(max-width: 600px) 50vw, 
                     (max-width: 1024px) 25vw, 
                     16.6vw"
              className="object-cover" 
              priority={category.id < 6} 
            />
          </div>
          
          {/* Nome da Categoria */}
          <p className="
            mt-3 text-sm font-semibold text-gray-800 
            md:text-base 
            truncate w-full 
          ">
            {category.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CategoryCardListTailwind;