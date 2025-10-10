'use client';


import React, { useState, useEffect } from "react"; 
import { Star, ShoppingCart, CheckCircle, X } from "lucide-react"; 



interface ImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    width?: number;
    height?: number;
    // Allows other HTML props
    [key: string]: any; 
}

const Image = (props: ImageProps) => { 
  const { src, alt, fill, className, ...rest } = props;
  
  // Defines the base style with borderRadius
  let style: React.CSSProperties = { borderRadius: '8px' };

  if (fill) {
      // Defines the complete 'fill' style
      const fillStyle = { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
      } as any; 
      
      // Merges the base style with the fill style
      style = { ...style, ...fillStyle };
  }

  return <img src={src} alt={alt} className={className} style={style} {...rest} />;
};

// 2. SIMILAR PRODUCTS COMPONENT (Replaces '@/components/SimilarProducts')
const SimilarProducts = ({ products }: { products: Product[] }) => {
    if (!products || products.length === 0) return null;
    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Similar Products</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {products.map(p => (
                    <div key={p.id} className="min-w-[200px] p-4 border rounded-lg shadow-sm bg-white">
                        <p className="font-semibold text-gray-700 truncate">{p.name}</p>
                        <p className="text-sm text-gray-500 mt-1">$ {p.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// 3. CART LOGIC (Replaces '@/lib/useCart')
const LOCAL_STORAGE_KEY = 'handcrafted_heaven_cart';

interface ProductToAdd {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    imageSrc: string;
    quantity?: number; // Optional, defaults to 1 when adding
}

interface CartItem extends ProductToAdd {
    quantity: number;
}

const useCart = () => {
    // We use a simple state to simulate the cart at runtime
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Effect to load the cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
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

    // Effect to save the cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && isInitialized) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);


    const addItem = (product: ProductToAdd) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                // If it exists, increments the quantity
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // If it doesn't exist, adds as a new item (quantity = 1)
                return [
                    ...prevItems,
                    { ...product, quantity: 1 }
                ];
            }
        });
    };

    return { cartItems, addItem };
};




interface Review {
  customerName: string;
  customerImage: string;
  rating: number;
  date: string;
  comment: string;
}

interface Product {
  id: string;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  name: string;
  price: number;
  rating: number;
  reviews: Review[];
}

interface ProductClientProps {
  product: Product;
  similarProducts: Product[];
}

export default function ProductClient({ product, similarProducts }: ProductClientProps) {
  
  if (!product) {
      return <div className="text-center py-20 text-xl text-gray-500">Loading product details...</div>;
  }
    
  // --- Cart Logic ---
  const { addItem } = useCart();
  
  // --- STATE FOR TOAST/NOTIFICATION ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Safe access to product.imageUrls now that product is guaranteed
  const [mainImage, setMainImage] = useState(
    (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl
  );


  const handleAddToCart = () => {
    // Maps the complete product data to the ProductToAdd format
    const itemToAdd: ProductToAdd = {
      id: product.id,
      name: product.name,
      description: product.description,
      unitPrice: product.price, 
      imageSrc: product.imageUrl,
    };

    addItem(itemToAdd);
    
    // 1. Defines the success message
    const message = `"${product.name}" added to cart!`;

    // 2. Sets the state to show the Toast
    setToastMessage(message);
    setShowToast(true);

    // 3. Sets a timeout to hide the Toast after 4 seconds (4000ms)
    setTimeout(() => {
      setShowToast(false);
      setToastMessage('');
    }, 4000);
    
    // The console.log remains useful for debugging
    console.log(`Product ${product.name} added/updated in the cart.`);
  };
  // --- End of Cart Logic ---

  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-6 h-6 text-yellow-400"
          style={{ fill: "url(#half-gradient)" }}
        />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
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
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="rounded-lg shadow-lg object-cover"
            />
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            {/* Safe access to product.imageUrls */}
            {product.imageUrls && product.imageUrls.slice(0, 3).map((url, index) => (
              <button
                type="button"
                aria-label={`Select image ${index + 1} of ${product.name}`}
                key={index}
                onClick={() => setMainImage(url)}
                className={`relative w-[80px] h-[80px] rounded-lg overflow-hidden border-2 transition ${
                  mainImage === url
                    ? "border-red-600"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >
                <Image
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-primary-800">{product.name}</h1>

          {/* Rating */}
          <div className="mt-2">{renderStars(product.rating)}</div>

          {/* divider */}
          <hr className="my-6 border-gray-300" />

          {/* Price */}
          <p className="text-2xl text-gray-900 font-semibold">
            $ {product.price.toFixed(2)}
          </p>

          {/* divider */}
          <hr className="my-6 border-gray-300" />

          {/* Description */}
          <p className="mt-2 text-lg text-gray-700">{product.description}</p>

          {/* Adjusted Add to Cart Button */}
          <button 
            onClick={handleAddToCart} // CALLS THE CART LOGIC
            className="
              mt-8 w-full px-8 py-3 
              font-bold rounded-lg shadow-lg 
              bg-[#7B3F00] text-white hover:bg-[#633300] 
              transition-colors duration-300 
              flex items-center justify-center space-x-2
            "
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      
      {/* Similar Products Section */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-7xl">
          <SimilarProducts products={similarProducts} />
        </div>
      </div>
      
      {/* Separator and Reviews Section */}
      <hr className="my-8 border-gray-300" />
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Reviews</h2>
        <div className="space-y-8">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border rounded-lg shadow-sm bg-white">
                {/* Customer Photo */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={review.customerImage}
                    alt={review.customerName}
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                
                {/* Container for Name, Date, Rating, and Comment */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Name, Date, and Rating */}
                  <div className="flex flex-col w-full sm:w-auto">
                    <h4 className="font-semibold text-lg">{review.customerName}</h4>
                    <span className="text-sm text-gray-500">{review.date}</span>
                    <div className="mt-1">{renderStars(review.rating)}</div>
                  </div>
                  
                  {/* Comment */}
                  <div className="flex-1">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reviews found for this product.</p>
          )}
        </div>
      </div>
      
      {/* --- TOAST NOTIFICATION (TOP FULL-WIDTH BAR) --- */}
      {showToast && (
        <div 
          className="
            fixed top-40 left-0 w-full z-50 p-4 
            bg-green-600 text-white shadow-2xl 
            transition-opacity duration-500 ease-out opacity-100
            flex justify-center // Centers the content block horizontally
          "
          role="alert"
        >
          {/* Inner container to constrain width and use space-between for alignment */}
          <div className="flex items-center justify-between w-full max-w-7xl px-4"> 
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" /> {/* Success icon */}
                <p className="font-medium">{toastMessage}</p>
              </div>
              <button 
                  onClick={() => setShowToast(false)} 
                  className="p-1 text-green-100 hover:text-white rounded-full transition"
                  aria-label="Close notification"
              >
                  <X className="w-5 h-5" /> {/* Close icon */}
              </button>
          </div>
        </div>
      )}
      {/* ---------------------------------- */}
    </div>
  );
}
