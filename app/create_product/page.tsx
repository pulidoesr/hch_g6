import React, { useState, useRef, useCallback } from 'react';
import Head from 'next/head';

// 1. Tipagem para o evento de input de arquivo (CORREÇÃO TS)
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

// O componente deve ser um arquivo .tsx
const ProductEditor = () => {
  const [productTitle, setProductTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  // 2. Tipagem para o estado 'images' (opcional, mas recomendado)
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Ref to trigger the hidden file input dialog
  // 3. Tipagem para a ref do input (opcional, mas recomendado)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for save logic
    alert('Product Saved! (Simulated)');
    console.log({ productTitle, price, description, images });
  };

  // 4. Aplicando a tipagem InputChangeEvent para resolver o erro
  const handleImageInsert = (e: InputChangeEvent) => {
    // Acesso seguro aos arquivos
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // Convert file objects to temporary URLs for immediate display
    // O TypeScript agora reconhece que 'file' é do tipo File (que é um Blob)
    const newImageUrls = files.map(file => URL.createObjectURL(file));

    setImages(prevImages => [...prevImages, ...newImageUrls]);

    // Clear the input value
    e.target.value = ''; // Limpar o valor com string vazia
  };
  
  const handleImageDelete = () => {
    if (selectedImageIndex === null) {
      alert('Please select an image to delete first.');
      return;
    }

    // Filter out the selected image by index
    setImages(prevImages => 
      prevImages.filter((_, index) => index !== selectedImageIndex)
    );
    
    // Reset selection after deletion
    setSelectedImageIndex(null);
  };
  
  const handleImageSelect = useCallback((index: number) => {
    // Toggle selection: if clicked image is already selected, deselect it.
    setSelectedImageIndex(index === selectedImageIndex ? null : index);
  }, [selectedImageIndex]);


  return (
    <>
      <Head>
        <title>Product Editor</title>
      </Head>

      <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen relative">
        {/* TOP RIGHT SAVE BUTTON */}
        <button 
          className="absolute top-4 right-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md" 
          onClick={handleSave}
        >
          Save Product
        </button>

        <form onSubmit={handleSave} className="mt-20 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>

          {/* Product Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input
              id="title"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[150px] focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            />
          </div>

          {/* IMAGE CONTROLS */}
          <h3 className="text-xl font-semibold mt-4">Product Images</h3>
          <div className="flex gap-4 mb-6">
            {/* Hidden file input (the actual file selector) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageInsert}
              accept="image/*" /* Only images allowed */
              multiple
              className="hidden"
            />

            {/* Insert Image Button (triggers the hidden input) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()} // Uso de optional chaining na ref
              className="w-40 h-10 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md flex items-center justify-center"
            >
              Insert Image
            </button>

            {/* Delete Image Button (same size, different color, disabled if no selection) */}
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
              images.map((url, index) => (
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