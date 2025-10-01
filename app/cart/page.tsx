// Main Checkout Page Component (UPDATED AND TRANSLATED)
'use client'; 

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Truck, CreditCard } from 'lucide-react';


// Assuming these imports are correct based on your file structure
import ShippingDetailsTab from '@/components/ShippingDetailsTab/ShippingDetailsTab'; 
import PaymentOptionsTab from '@/components/Checkout/PaymentOptionsTab'; 
import { useShippingAddress } from '@/lib/checkout-utils'; 

// --- PERSISTENT HOOK SIMULATION (Replace with real import) ---
// *************************************************************************

interface CartItem {
  id: number;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
  imageSrc: string;
}
const LOCAL_STORAGE_KEY = 'handcrafted_heaven_cart';

// --- PERSISTENT HOOK SIMULATION (FIXED FOR HYDRATION) ---
// *************************************************************************

const useCart = () => {
    // 1. Initialize state as EMPTY. Same state on Server and Client to prevent hydration errors.
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // 2. Load localStorage ONLY after component mounts (Client-side).
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
            try {
                const initialCart = storedCart ? JSON.parse(storedCart) : [];
                setCartItems(initialCart); // Set state after mounting is safe
            } catch (error) {
                console.error("Error loading cart:", error);
            }
        }
    }, []); // Empty dependency array: runs only once on client mount

    // 3. Keep useEffect to save the state.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems]);
    
    return { cartItems, setCartItems };
};
// *************************************************************************

// --- Constants and Types ---

type Tab = 'cart' | 'shipping' | 'payment';

const TAXES = 13.00;
const FREE_SHIPPING_THRESHOLD = 200.00;
const SHIPPING_COST = 20.00;

// --- Calculation Utilities ---
const calculateSummary = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingValue = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const shippingDisplay = shippingValue === 0 ? 'FREE' : `$${shippingValue.toFixed(2)}`;
  const total = subtotal + shippingValue + TAXES;
  
  return { subtotal, shippingValue, shippingDisplay, taxes: TAXES, total };
};

// --- Layout Components ---

/**
 * Quantity control component with increment/decrement buttons.
 */
interface QuantityControlProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({ quantity, onChange }) => {
  return (
    <div className="flex items-center border border-[#4D2A0C] rounded-md h-[44px] w-[120px] bg-[#8B4513] px-2">
      <input
        type="number"
        value={quantity}
        min={1}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className="w-full text-center text-base font-semibold bg-transparent text-white focus:outline-none"
      />
      <div className="flex flex-col ml-2">
        <div
          onClick={() => onChange(quantity + 1)}
          className="cursor-pointer text-white"
          role="button"
          tabIndex={0}
        >
          ▲
        </div>
        <div
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className="cursor-pointer text-white"
          role="button"
          tabIndex={0}
        >
          ▼
        </div>
      </div>
    </div>
  );
};

/**
 * Component that displays a single item in the cart list.
 */
interface CartItemRowProps {
    item: CartItem;
    onUpdateQuantity: (id: number, newQuantity: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onUpdateQuantity }) => {
    return (
        <div className="flex py-6 border-b border-gray-200">
            {/* Thumbnail Image */}
            <div className="w-40 h-40 flex-shrink-0 relative border">
                <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                />
            </div>
            
            {/* Product Details (Name, Description, Price) */}
            <div className="flex-grow px-4 md:px-8">
                <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                <p className="font-medium text-gray-900 mt-2 text-xl">
                    ${item.unitPrice.toFixed(2)}
                </p>
            </div>
            
            {/* Quantity Control */}
            <div className="flex items-center justify-end">
                <QuantityControl 
                    quantity={item.quantity} 
                    onChange={(q) => onUpdateQuantity(item.id, q)}
                />
            </div>
        </div>
    );
};

// --- Summary Component ---
interface SummaryProps {
    summary: ReturnType<typeof calculateSummary>;
}

const Summary: React.FC<SummaryProps> = ({ summary }) => {
    const { subtotal, shippingDisplay, taxes, total } = summary;

    const SummaryRow: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass = '' }) => (
        <div className="flex justify-between mb-2">
            <span className="text-gray-600 uppercase text-sm">{label}</span>
            <span className={`font-medium ${valueClass}`}>
                {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
            </span>
        </div>
    );

    return (
        <div className="p-4 md:p-0">
            <h2 className="text-2xl font-normal tracking-wide mb-6">Summary</h2>
            <p className="text-sm text-gray-500 mb-6 border-b pb-4">
                <a href="#" className="underline">ENTER COUPON CODE</a>
            </p>
            <SummaryRow label="SUBTOTAL" value={subtotal} />
            <SummaryRow 
                label="SHIPPING" 
                value={shippingDisplay} 
                valueClass={shippingDisplay === 'FREE' ? 'text-green-600' : ''}
            />
            <SummaryRow label="TAXES" value={taxes} />
            <div className="my-6 border-t pt-6">
                <div className="flex justify-between">
                    <span className="text-xl font-medium tracking-wide">TOTAL</span>
                    <span className="text-2xl font-semibold text-gray-900">
                        ${total.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- Shopping Cart Tab Component ---

interface ShoppingCartTabProps {
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    onNext: () => void;
    onCancel: () => void; // The onCancel prop is in the interface
}

const ShoppingCartTab: React.FC<ShoppingCartTabProps> = ({ cartItems, setCartItems, onNext, onCancel }) => {
    
    const summary = useMemo(() => calculateSummary(cartItems), [cartItems]);

    const handleUpdateQuantity = (id: number, newQuantity: number) => {
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-10">
                <section className="lg:w-2/3">
                    <h2 className="text-2xl font-normal tracking-wide mb-6">Shopping Cart</h2>
                    
                    {cartItems.map(item => (
                        <CartItemRow 
                            key={String(item.id)} // Fixed key to string to aid hydration
                            item={item} 
                            onUpdateQuantity={handleUpdateQuantity} 
                        />
                    ))}
                </section>

                <section className="lg:w-1/3">
                    <Summary summary={summary} />
                </section>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 flex space-x-4">
                <button
                    onClick={onNext}
                    className="
                        bg-[#7B3F00] text-white py-3 px-8 
                        font-medium rounded-sm shadow-md
                        hover:bg-[#633300] transition duration-200
                    "
                >
                    Next
                </button>
                
                <button
                    onClick={onCancel} // Correctly calls the onCancel prop
                    className="
                        bg-gray-200 text-gray-700 py-3 px-8 
                        font-medium rounded-sm shadow-md
                        hover:bg-gray-300 transition duration-200
                    "
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

// --- Main Checkout Page Component (UPDATED) ---

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('cart');
  
  // Uses the hook to load the cart from Local Storage
  const { cartItems, setCartItems } = useCart();
  // Assume useShippingAddress also uses a hydration-safe pattern
  const { shippingAddress, setShippingAddress } = useShippingAddress(); 

  const tabs: { id: Tab; name: string; icon: React.FC<any> }[] = [
    { id: 'cart', name: 'Shopping Cart', icon: ShoppingCart },
    { id: 'shipping', name: 'Shipping Details', icon: Truck },
    { id: 'payment', name: 'Payment Options', icon: CreditCard },
  ];
  
  const handleNext = () => {
    if (activeTab === 'cart') setActiveTab('shipping');
    else if (activeTab === 'shipping') setActiveTab('payment');
    // Add transition to confirmation (review/confirmation) if needed
  };
  
  const handleBack = () => {
    if (activeTab === 'shipping') setActiveTab('cart');
    else if (activeTab === 'payment') setActiveTab('shipping');
  };

  const handleCancel = () => {
    router.push('/'); 
  };
  
  const TabHeader: React.FC<{ tab: Tab, index: number }> = ({ tab, index }) => {
    const isActive = activeTab === tab;
    return (
      <div 
        className={`text-lg font-normal cursor-pointer transition duration-200 ${
          isActive ? 'text-gray-900 border-b border-gray-600 pb-2' : 'text-gray-500'
        }`}
        // Allows clicking only on previous tabs (Standard checkout flow safety)
        onClick={() => index < tabs.findIndex(t => t.id === activeTab) && setActiveTab(tab)}
      >
        <span className="font-semibold mr-1">{index + 1}.</span> {tabs.find(t => t.id === tab)?.name}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-10">
        
        {/* --- Navigation Tabs --- */}
        <div className="flex justify-between sm:justify-start sm:space-x-12 mb-12 border-b border-gray-300">
          {tabs.map((tab, index) => (
            <TabHeader key={tab.id} tab={tab.id} index={index} />
          ))}
        </div>

        {/* --- Tab Content --- */}
        <div>
          {activeTab === 'cart' && (
            <ShoppingCartTab 
              cartItems={cartItems} 
              setCartItems={setCartItems}
              onNext={handleNext} 
              onCancel={handleCancel} // Prop passed correctly
            />
          )}
          
          {activeTab === 'shipping' && (
              <ShippingDetailsTab 
                  onNext={handleNext} 
                  onBack={handleBack} 
                  initialAddress={shippingAddress} 
                  onSaveAddress={setShippingAddress} 
                  // You should pass onCancel to ShippingDetailsTab when implementing its buttons
                  // onCancel={handleCancel} 
              />
          )}
          
          {activeTab === 'payment' && (
            <PaymentOptionsTab 
                onNext={handleNext} 
                onBack={handleBack} 
                // You should pass onCancel to PaymentOptionsTab when implementing its buttons
                // onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;