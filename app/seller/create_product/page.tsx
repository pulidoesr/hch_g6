"use client";
import React, { useState, useRef, useCallback } from "react";

// TS type for the file input change
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

const ProductEditor = () => {
  const [productTitle, setProductTitle] = useState("");
  const [price, setPrice] = useState(""); 
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accept both form submit and button click
  function handleSave(
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) {
    e?.preventDefault?.();

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      alert("Please enter a valid non-negative price.");
      return;
    }

    // Placeholder for save logic
    alert("Product Saved! (Simulated)");
    console.log({
      productTitle,
      price: priceNum,
      description,
      images,
    });
  }

  const handleImageInsert = (e: InputChangeEvent) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // Create temporary preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImageUrls]);

    // Clear the input to allow re-selecting the same file(s) if needed
    e.target.value = "";
  };

  const handleImageDelete = () => {
    if (selectedImageIndex === null) {
      alert("Please select an image to delete first.");
      return;
    }

    // Revoke the blob URL to avoid memory leaks
    URL.revokeObjectURL(images[selectedImageIndex]);

    setImages((prev) => prev.filter((_, i) => i !== selectedImageIndex));
    setSelectedImageIndex(null);
  };

  const handleImageSelect = useCallback(
    (index: number) => {
      setSelectedImageIndex(index === selectedImageIndex ? null : index);
    },
    [selectedImageIndex]
  );

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen relative">
        {/* TOP RIGHT SAVE BUTTON */}
        <button
          type="button"
          className="absolute top-4 right-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          onClick={handleSave}
        >
          Save Product
        </button>

        <form onSubmit={handleSave} className="mt-20 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Product</h1>

          {/* Product Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Title
            </label>
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
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price
            </label>
            <div className="flex items-center">
              <span className="p-3 border border-r-0 border-gray-300 bg-gray-50 rounded-l-lg text-gray-500">
                $
              </span>
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageInsert}
              accept="image/*"
              multiple
              className="hidden"
              title="Product title"  
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-10 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md flex items-center justify-center"
            >
              Insert Image
            </button>

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
              <p className="text-gray-500">
                No images added yet. Click &apos;Insert Image&apos; to upload.
              </p>
            ) : (
              images.map((url, index) => (
                <div
                  key={`${index}-${url}`}
                  onClick={() => handleImageSelect(index)}
                  className={`w-36 h-36 relative cursor-pointer rounded-lg overflow-hidden transition ${
                    index === selectedImageIndex
                      ? "border-4 border-blue-600 ring-2 ring-blue-600"
                      : "border-4 border-transparent hover:border-blue-200"
                  }`}
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

          {/* Optional bottom submit button */}
          <div>
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductEditor;
