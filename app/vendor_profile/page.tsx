// app/page.tsx
import Image from 'next/image';
// Importação do arquivo JSON completo
import rawData from '@/data/products.json'; // Assumindo que você moveu products.json para /data
import { loadSellerData, Product, Seller } from '@/lib/types/product-data';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';

// Definimos o ID do vendedor que estamos editando
const TARGET_SELLER_ID = 1; // Clara Mendes (Ceramics Artist)

// Este é um Server Component e fará o Data Fetching no servidor.
export default function SellerDashboard() {
  // 1. Processamento dos Dados
  const { seller, products }: { seller: SellerProfile; products: ProductData[]; } = loadSellerData(rawData, TARGET_SELLER_ID);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. SEÇÃO DO VENDEDOR (TOPO) */}
        <header className="relative text-center pb-8">
          
          {/* Botão Salvar (Canto Superior Direito) */}
          <div className="absolute top-0 right-0">
            <Button variant="primary" onClick={() => console.log('Salvar perfil')}>
              Save
            </Button>
          </div>

          {/* Nome do Vendedor */}
          {/* Usamos o nome do vendedor Clara Mendes */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 pt-12">
            {seller.name}
          </h1>

          {/* Foto Redonda do Vendedor */}
          <div className="mx-auto w-32 h-32 md:w-40 md:h-40 relative">
            <Image
              src={seller.photoUrl} 
              alt={`Foto de perfil de ${seller.name}`}
              layout="fill"
              objectFit="cover"
              className="rounded-full border-4 border-white shadow-xl"
            />
          </div>
          
        </header>

        {/* Linha Divisória */}
        <hr className="my-8 border-gray-300" />
        
        {/* 2. SEÇÃO ABOUT ME */}
        <section className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">About Me</h2>
          
          {/* Caixa de Texto para o "About Me" */}
          <div className="max-w-4xl mx-auto px-4">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none text-gray-700"
              rows={6}
              defaultValue={seller.aboutMeText} // Texto de Clara Mendes
              placeholder="Fale um pouco sobre você e sua arte..."
              // Em um sistema real, este campo seria um Client Component para permitir edição.
              readOnly
            />
          </div>
        </section>

        {/* Linha Divisória */}
        <hr className="my-10 border-gray-300" />

        {/* 3. SEÇÃO MY COLLECTION */}
        <section className="mt-10">
          
          {/* Título e Botões de Ação */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center md:text-left md:w-full">
              My Collection ({seller.collectionName}) {/* Nome da coleção: Clay & Glaze */}
            </h2>
            
            {/* Botões de Ação (Alinhados à direita) */}
            <div className="flex flex-wrap justify-center md:justify-end gap-3 mt-4 md:mt-0">
              <Button variant="secondary">Edit Product</Button>
              <Button variant="delete">Delete Product</Button>
              <Button variant="primary">Add Product</Button>
            </div>
          </div>
          
          {/* Grade de Cards de Produtos (Responsiva) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 p-4">
            {/* Renderiza os produtos filtrados (apenas os da coleção 'Clay & Glaze') */}
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Botão Final de Salvamento */}
          <div className="flex justify-end mt-12 mb-8 p-4">
            <Button variant="primary" className="w-full md:w-auto" onClick={() => console.log('Salvar tudo')}>
              Save All Changes
            </Button>
          </div>
        </section>

      </div>
    </main>
  );
}