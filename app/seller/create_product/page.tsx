"use client";
import React, { useState, useRef, useCallback } from 'react';
import { createProductAction } from '@/lib/server/actions/client_action'; 

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type ImageFile = {
    url: string;
    file: File;
};

const ProductEditor = () => {
  const [productTitle, setProductTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageInsert = (e: InputChangeEvent) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const newImages: ImageFile[] = files.map(file => ({
        url: URL.createObjectURL(file),
        file: file,
    }));

    setImages(prevImages => [...prevImages, ...newImages]);
    e.target.value = '';
  };
  
  const handleImageDelete = () => {
    if (selectedImageIndex === null) {
      alert('Please select an image to delete first.');
      return;
    }

    URL.revokeObjectURL(images[selectedImageIndex].url);
    
    setImages(prevImages => 
      prevImages.filter((_, index) => index !== selectedImageIndex)
    );
    
    setSelectedImageIndex(null);
  };
  
  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index === selectedImageIndex ? null : index);
  }, [selectedImageIndex]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!productTitle || !price || !description || images.length === 0) {
        setMessage({ type: 'error', text: 'Todos os campos (Título, Preço, Descrição) e ao menos 1 imagem são obrigatórios.' });
        return;
    }

    const dataToSend = {
        title: productTitle,
        price: parseFloat(price),
        description: description,
    };

    setIsSaving(true);
    
    try {
        const result = await createProductAction(dataToSend); 
        
        if (result.success) {
            setMessage({ type: 'success', text: `🎉 Produto criado com sucesso! ${result.message}` });
        } else {
            setMessage({ type: 'error', text: `❌ Erro ao salvar: ${result.message}` });
        }
    } catch (error) {
        console.error("Server Action Failed:", error);
        setMessage({ type: 'error', text: '❌ Ocorreu um erro inesperado no servidor.' });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen relative">
        {/* TOP RIGHT SAVE BUTTON */}
        <button 
          className="absolute top-4 right-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>

        <form onSubmit={handleSave} className="mt-20 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Product</h1>
            
            {/* Mensagens de Sucesso/Erro */}
            {message && (
                <div 
                    className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    role="alert"
                >
                    {message.text}
                </div>
            )}


          {/* Product Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input
              id="title"
              name="title" 
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div className="flex items-center">
              <span className="p-3 border border-r-0 border-gray-300 bg-gray-50 rounded-l-lg text-gray-500">$</span>
              <input
                id="price"
                name="price_dollars"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-r-lg focus:ring-blue-500 focus:border-blue-500 text-base"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[150px] focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            />
          </div>

          {/* IMAGE CONTROLS */}
          <h3 className="text-xl font-semibold mt-4">Product Images</h3>
          
          {/* Validação de Imagem na interface */}
          {images.length === 0 && (
             <p className="text-red-500 text-sm font-medium">⚠️ É obrigatório anexar ao menos uma imagem.</p>
          )}

          <div className="flex gap-4 mb-6">
            {/* Hidden file input (the actual file selector) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageInsert}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Insert Image Button (triggers the hidden input) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-10 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md flex items-center justify-center"
            >
              Insert Image
            </button>

            {/* Delete Image Button */}
            <button
              type="button"
              onClick={handleImageDelete}
              disabled={selectedImageIndex === null}
              className="w-40 h-10 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-md flex items-center justify-center disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              Delete Image
            </button>
          </div>
          
          {/* IMAGE GALLERY */}
          <div className="flex flex-wrap gap-4">
            {images.length === 0 ? (
              <p className="text-gray-500">No images added yet. Click 'Insert Image' to upload.</p>
            ) : (
              images.map((img, index) => (
                <div
                  key={index}
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
                    src={img.url}
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