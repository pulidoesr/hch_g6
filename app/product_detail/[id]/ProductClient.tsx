'use client';

import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, CheckCircle, X, User } from "lucide-react";
import type { Product, Review } from "@/lib/types/product";

/* ---- Lightweight <Image> shim for client rendering ---- */
interface ImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}
const Image = (props: ImageProps) => {
  const { src, alt, fill, className, ...rest } = props;
  let style: React.CSSProperties = { borderRadius: "8px" };
  if (fill) {
    const fillStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    } as any;
    style = { ...style, ...fillStyle };
  }
  return <img src={src} alt={alt} className={className} style={style} {...rest} />;
};

/* ---------------- Similar Products ---------------- */
const SimilarProducts = ({ products }: { products: Product[] }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Similar Products</h3>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {products.map((p) => (
          <div key={p.id} className="min-w-[200px] p-4 border rounded-lg shadow-sm bg-white">
            <p className="font-semibold text-gray-700 truncate">{p.name}</p>
            <p className="text-sm text-gray-500 mt-1">$ {p.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- Cart Hook ---------------- */
const LOCAL_STORAGE_KEY = "handcrafted_heaven_cart";
type ProductToAdd = {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  imageSrc: string;
  quantity?: number;
};
type CartItem = ProductToAdd & { quantity: number };

const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      try {
        const initialCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
        setCartItems(initialCart);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addItem = (product: ProductToAdd) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return { cartItems, addItem };
};

/* ---------------- Component ---------------- */
type ProductClientProps = {
  product: Product;
  similarProducts: Product[];
};

export default function ProductClient({ product, similarProducts }: ProductClientProps) {
  if (!product) {
    return <div className="text-center py-20 text-xl text-gray-500">Loading product details...</div>;
  }

  const { addItem } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [mainImage, setMainImage] = useState(
    product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product.imageUrl
  );

  const handleAddToCart = () => {
    const itemToAdd: ProductToAdd = {
      id: product.id,
      name: product.name,
      description: product.description,
      unitPrice: product.price,
      imageSrc: product.imageUrl,
    };
    addItem(itemToAdd);
    setToastMessage(`"${product.name}" added to cart!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
    }, 4000);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;

    for (let i = 0; i < full; i++) {
      stars.push(<Star key={`full-${i}`} className="w-6 h-6 text-yellow-400 fill-yellow-400" />);
    }
    if (hasHalf) {
      stars.push(
        <Star key="half" className="w-6 h-6 text-yellow-400" style={{ fill: "url(#half-gradient)" }} />
      );
    }
    const empty = 5 - stars.length;
    for (let i = 0; i < empty; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-6 h-6 text-gray-300" />);
    }

    return (
      <div className="flex items-center gap-1 relative">
        <svg width="0" height="0">
          <defs>
            <linearGradient id="half-gradient" x1="0" x2="100%" y1="0" y2="0">
              <stop offset="50%" stopColor="rgb(250 204 21)" />
              <stop offset="50%" stopColor="rgb(209 213 219)" />
            </linearGradient>
          </defs>
        </svg>
        {stars}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-[10px] w-[100vw] mt-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Gallery */}
        <div className="flex-1 relative">
          <div className="relative w-full h-[500px]">
            <Image src={mainImage} alt={product.name} fill className="rounded-lg shadow-lg object-cover" />
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {product.imageUrls &&
              product.imageUrls.slice(0, 3).map((url, index) => (
                <button
                  type="button"
                  aria-label={`Select image ${index + 1} of ${product.name}`}
                  key={index}
                  onClick={() => setMainImage(url)}
                  className={`relative w-[80px] h-[80px] rounded-lg overflow-hidden border-2 transition ${
                    mainImage === url ? "border-red-600" : "border-gray-300 hover:border-gray-500"
                  }`}
                >
                  <Image src={url} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-primary-800">{product.name}</h1>

          <div className="mt-2">{renderStars(product.rating)}</div>

          <hr className="my-6 border-gray-300" />

          <p className="text-2xl text-gray-900 font-semibold">$ {product.price.toFixed(2)}</p>

          <hr className="my-6 border-gray-300" />

          <p className="mt-2 text-lg text-gray-700">{product.description}</p>

          <button
            onClick={handleAddToCart}
            className="mt-8 w-full px-8 py-3 font-bold rounded-lg shadow-lg bg-[#7B3F00] text-white hover:bg-[#633300] transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Similar Products */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-7xl">
          <SimilarProducts products={similarProducts} />
        </div>
      </div>

      {/* Reviews */}
      <hr className="my-8 border-gray-300" />
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Reviews</h2>
        <div className="space-y-8">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review: Review, index: number) => {
              const name = review.customerName ?? "Anonymous";
              const avatar = review.customerImage ?? "";

              return (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 border rounded-lg shadow-sm bg-white"
                >
                  {/* Avatar (fallback to icon) */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <Image src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="flex flex-col w-full sm:w-auto">
                      <h4 className="font-semibold text-lg">{name}</h4>
                      <span className="text-sm text-gray-500">{review.date}</span>
                      <div className="mt-1">{renderStars(review.rating)}</div>
                    </div>

                    <div className="flex-1">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No reviews found for this product.</p>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="
            fixed top-40 left-0 w-full z-50 p-4
            bg-green-600 text-white shadow-2xl
            transition-opacity duration-500 ease-out opacity-100
            flex justify-center
          "
          role="alert"
        >
          <div className="flex items-center justify-between w-full max-w-7xl px-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <p className="font-medium">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="p-1 text-green-100 hover:text-white rounded-full transition"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
