// components/ProductEditor/ProductEditor.tsx
"use client";
import React, { useState, useRef, useCallback,FormEvent } from 'react';
import { updateProduct } from '@/lib/server/actions/data-loader'; 
import Button from '@/components/Button/Button';

// Tipagem simplificada para o editor
type Product = {
    id: string;
    name: string;
    imageUrls: string[]; 
    price: number;
    description: string;
};

type ProductEditorProps = {
    initialProduct: Partial<Product>; 
    isNew: boolean; 
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

const ProductEditor = ({ initialProduct, isNew }: ProductEditorProps) => {
  
  // 🟢 Inicializa o estado com os dados recebidos do Server Component
  const [productTitle, setProductTitle] = useState(initialProduct.name || '');
  const [price, setPrice] = useState(String(initialProduct.price || ''));
  const [description, setDescription] = useState(initialProduct.description || '');
  
  // Imagens
  const [images, setImages] = useState<string[]>(initialProduct.imageUrls || []);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    
    // Coleta os dados para salvar
    const productDataToSave: Product = {
        id: initialProduct.id || crypto.randomUUID(), 
        name: productTitle,
        price: parseFloat(price),
        description: description,
        imageUrls: images, 
    };

    try {
        await updateProduct(productDataToSave); 
        alert(`Produto ${isNew ? 'Criado' : 'Atualizado'} com sucesso!`);
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert('Erro ao salvar o produto. Verifique o console.');
    }
  };

  const handleSaveClick = () => {
      // Wrapper para o botão superior
      const fakeEvent = { preventDefault: () => {} } as FormEvent;
      handleSave(fakeEvent);
  };
  
  // ... (funções de manipulação de imagem omitidas para brevidade, elas já estavam corretas) ...
  
  const handleImageInsert = (e: InputChangeEvent) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...newImageUrls]);
    e.target.value = ''; 
  };
  
  const handleImageDelete = () => {
    if (selectedImageIndex === null) return;
    URL.revokeObjectURL(images[selectedImageIndex]); 
    setImages(prevImages => 
      prevImages.filter((_, index) => index !== selectedImageIndex)
    );
    setSelectedImageIndex(null);
  };
  
  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index === selectedImageIndex ? null : index);
  }, [selectedImageIndex]);


  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen relative">
        {/* TOP RIGHT SAVE BUTTON */}
        <Button 
          type="button"
          className="absolute top-4 right-4" 
          onClick={handleSaveClick}
          variant="primary"
        >
          {isNew ? 'Create Product' : 'Save Changes'}
        </Button>

        <form onSubmit={handleSave} className="mt-20 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isNew ? 'Criar Novo Produto' : `Product Edit: ${productTitle}`}
          </h1>

          {/* 🎯 CAMPOS DE EDIÇÃO ADICIONADOS AQUI: */}
          
          {/* Nome do Produto */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              id="product-name"
              className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm p-2"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              required
            />
          </div>

          {/* Preço */}
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Price (R$)</label>
            <input
              type="number"
              id="product-price"
              className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm p-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="product-description"
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* FIM DOS CAMPOS DE EDIÇÃO */}

          {/* IMAGE CONTROLS */}
          <h3 className="text-xl font-semibold mt-4">Product Images</h3>
          <div className="flex gap-4 mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageInsert}
              accept="image/*" 
              multiple
              className="hidden"
            />

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()} 
              variant="secondary"
              className="w-40 h-10"
            >
              Insert Image
            </Button>

            <Button
              type="button"
              onClick={handleImageDelete}
              disabled={selectedImageIndex === null}
              variant="delete"
              className="w-40 h-10"
            >
              Delete Image
            </Button>
          </div>
          
          {/* IMAGE GALLERY */}
          <div className="flex flex-wrap gap-4">
            {images.length === 0 ? (
              <p className="text-gray-500">No images added yet. Click &aposInsert Image&apos to upload.</p>
            ) : (
              images.map((url, index) => (
                <div
                  key={url} 
                  onClick={() => handleImageSelect(index)}
                  className={`
                    w-36 h-36 relative cursor-pointer rounded-lg overflow-hidden transition 
                    ${index === selectedImageIndex 
                      ? 'border-4 border-blue-600 ring-2 ring-blue-600' 
                      : 'border-4 border-transparent hover:border-blue-200'
                    }
                  `}
                >
                  <img
                    src={url}
                    alt={`Product Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductEditor;