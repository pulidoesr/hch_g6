export default async function CollectionsPage() {
  let collections;
  // Detecta ambiente de build/prerender
  const isBuild = typeof window === 'undefined' && process.env.NODE_ENV === 'production';
  if (isBuild) {
    // Usa dados mockados do arquivo JSON
    collections = productsData;
  } else {
    const res = await fetch('http://localhost:3000/api/products');
    if (!res.ok) {
      console.error('Failed to fetch collections', res.status);
      notFound();
    }
    collections = await res.json();
  }
  // Passa os dados buscados do servidor para o componente de cliente
  return <CollectionsClient collections={collections} />;
}
// src/app/collections/page.js
import CollectionsClient from '@app/components/CollectionClient/CollectionClient';
import { notFound } from 'next/navigation';
import productsData from '../../../data/products.json';

  let collections;
  // Detecta ambiente de build/prerender
  const isBuild = typeof window === 'undefined' && process.env.NODE_ENV === 'production';
  if (isBuild) {
    // Usa dados mockados do arquivo JSON
    collections = productsData;
  } else {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${BASE_URL}/api/products`);
    if (!res.ok) {
      console.error('Failed to fetch collections', res.status);
      notFound();
    }
    collections = await res.json();
  }
