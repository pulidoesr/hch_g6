"use client";

import { useState, useEffect } from "react";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import CuratedCollection from "@/components/CuratedCollections/CuratedCollections";
import ProductCard from "@/components/ProductCard/ProductCard";
import Link from "next/link";

// Definindo as interfaces do JSON original
interface ProductData {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  url_external?: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

interface CollectionData {
  id: number;
  name: string;
  isFeatured: boolean;
  story: string;
  imagePath: string;
  productIds: string[];
  recommendedProductIds: string[];
}

// Interface para o componente
interface CombinedCollection {
  id: number;
  name: string;
  isFeatured: boolean;
  story: string;
  imagePath: string;
  products: ProductData[];
  recommendedProducts: ProductData[];
}

// O componente agora recebe 'collections' via props
export default function CollectionsClient({ collections: initialCollections }: { collections: { collections: CollectionData[], products: ProductData[] } }) {
  const [selectedCollectionName, setSelectedCollectionName] = useState("");
  const [collections, setCollections] = useState<CombinedCollection[]>([]);

  useEffect(() => {
    // Processa os dados que vêm via props
    const combinedCollections = initialCollections.collections.map((collection: CollectionData) => {
      // Usa um type predicate na função de filtragem para remover `undefined`
      const products = collection.productIds
        .map(productId => initialCollections.products.find((p: ProductData) => p.id === productId))
        .filter((product): product is ProductData => product !== undefined);

      const recommendedProducts = collection.recommendedProductIds
        .map(productId => initialCollections.products.find((p: ProductData) => p.id === productId))
        .filter((product): product is ProductData => product !== undefined);

      return {
        ...collection,
        products,
        recommendedProducts,
      };
    });

    setCollections(combinedCollections);
  }, [initialCollections]);

  const selectedCollection = collections.find(c => c.name === selectedCollectionName);

  const story = selectedCollection ? selectedCollection.story : null;
  const collectionName = selectedCollection ? selectedCollection.name : null;
  const recommendedProducts = selectedCollection ? selectedCollection.recommendedProducts : [];
  
  const curatedCollectionImages = selectedCollection ? selectedCollection.products.map(p => ({
    id: p.id,
    name: p.name,
    url: p.imageUrl,
  })) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6 text-primary-800">Our Collections</h1>
      <ImageGallery
        collections={collections}
        selectedCollection={selectedCollectionName}
        setSelectedCollection={setSelectedCollectionName}
      />
      {story && (
        <div className="my-10 mx-auto max-w-7xl px-4 md:px-8">
          <hr className="my-6" />
          <h2 className="text-2xl font-bold mb-4 text-center">My Story</h2>
          <h3 className="text-xl font-semibold mb-4 text-center">{collectionName}</h3>
          <p className="text-black leading-relaxed">{story}</p>
          <hr className="my-6" />
          <CuratedCollection images={curatedCollectionImages} />
          <hr className="my-6" />
          <h2 className="text-2xl font-bold mb-4 text-center">Recommended products</h2>
          <p className="text-black leading-relaxed mb-8 text-center">
            Discover the perfect piece to complete your collection! Our recommended products are handpicked to offer the same quality and exclusivity you love. Do not miss the chance to add a special touch to your life.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProducts.map(product => (
              <Link key={product.id} href={`/product_detail/${product.id}`} passHref>
                <ProductCard
                  key={product.id}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  url_external={product.url_external}
                />
              </Link>   
            ))}
          </div>
        </div>
      )}
    </div>
  );
}