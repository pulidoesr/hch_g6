'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Truck, CreditCard, X } from 'lucide-react';

// Assuming these imports are correct based on your file structure
import ShippingDetailsTab from '@/components/ShippingDetailsTab/ShippingDetailsTab';
import PaymentOptionsTab from '@/components/Checkout/PaymentOptionsTab';
import { useShippingAddress, calculateSummary } from '@/lib/checkout-utils';

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
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' ) {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
            try {
                const initialCart = storedCart ? JSON.parse(storedCart) : [];
                setCartItems(initialCart);
                setIsInitialized(true); // Só ativa após leitura
            } catch (error) {
                console.error("Error loading cart:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && isInitialized) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);

    return { cartItems, setCartItems };
};
// *************************************************************************

// --- Constants and Types ---

type Tab = 'cart' | 'shipping' | 'payment';
type ShippingOption = 'free' | 'express'; 

const TAXES = 13.00;
const FREE_SHIPPING_THRESHOLD = 200.00;

const SHIPPING_COST: number = 0; 

// --- Calculation Utilities ---

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
        <div className="flex items-center border border-[#4D2A0C] rounded-md h-10 w-16 bg-[#8B4513]">
            <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
                className="w-full text-center text-base font-semibold bg-transparent text-white focus:outline-none"
            />
            <div className="flex flex-col ml-2 ">
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
    onRemoveItem: (id: number) => void; 
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onUpdateQuantity, onRemoveItem })=> {
    return (
        <div className="flex py-6 border-b border-gray-200">
            {/* Thumbnail Image */}
            <div className="w-24 h-24 md:w-40 md:h-40 flex-shrink-0 relative border">
                <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 96px, 160px"
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
            <div className="flex flex-col gap-6 items-center justify-end w-10 pr-4">
                <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition duration-150 p-1 rounded-full bg-white z-10"
                    aria-label={`Remove ${item.name} from cart`}
                >
                    <X className="w-7 h-6" />
                </button>
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
    shippingDisplay: string;
}

const Summary: React.FC<SummaryProps> = ({ summary, shippingDisplay }) => {
    const { subtotal, taxes, total } = summary;

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
    onCancel: () => void;
}

const ShoppingCartTab: React.FC<ShoppingCartTabProps> = ({ cartItems, setCartItems, onNext, onCancel }) => {

    const summary = useMemo(() => {
        const tempSummary = calculateSummary(cartItems, SHIPPING_COST);
        const subtotal = tempSummary.subtotal;
        
       
        const shippingValue = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        const shippingDisplay = shippingValue === 0 ? 'FREE' : `$${shippingValue.toFixed(2)}`;
        
        return {
            ...tempSummary,
    
            total: subtotal + tempSummary.taxes + shippingValue,
            shippingDisplay 
        };
    }, [cartItems]);
    
    const handleUpdateQuantity = (id: number, newQuantity: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };
    const handleRemoveItem = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-10">
                <section className="lg:w-2/3">
                    <h2 className="text-2xl font-normal tracking-wide mb-6">Shopping Cart</h2>

                    {cartItems.map(item => (
                        <CartItemRow 
                            key={String(item.id)} 
                            item={item} 
                            onUpdateQuantity={handleUpdateQuantity} 
                            onRemoveItem={handleRemoveItem} 
                        />
                    ))}
                </section>

                <section className="lg:w-1/3">
                    {/* Passando shippingDisplay para o Summary */}
                    <Summary summary={summary} shippingDisplay={summary.shippingDisplay} />
                </section>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-center sm:justify-left space-x-4">
                <button
                    onClick={onNext}
                    className="
                        h-12 w-30    
                        bg-[#7B3F00] text-white py-3 px-8
                        font-medium rounded-sm shadow-md
                        hover:bg-[#633300] transition duration-200
                    "
                >
                    Next
                </button>


                <button
                    onClick={onCancel}
                    className="
                        h-12 w-30  
                        bg-gray-200 text-gray-700 py-3 px-8
                        font-medium rounded-sm shadow-md
                        hover:bg-[#633300] transition duration-200
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

    const { shippingAddress, setShippingAddress } = useShippingAddress();
    
    const [selectedShipping, setSelectedShipping] = useState<ShippingOption>('free');

    const tabs: { id: Tab; name: string; icon: React.FC<any> }[] = [
        { id: 'cart', name: 'Shopping Cart', icon: ShoppingCart },
        { id: 'shipping', name: 'Shipping Details', icon: Truck },
        { id: 'payment', name: 'Payment Options', icon: CreditCard },
    ];


    const handleNext = () => {
        if (activeTab === 'cart') setActiveTab('shipping');
        else if (activeTab === 'shipping') setActiveTab('payment');

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
                {cartItems.length > 0 ? (
                    <>
                        <div>
                            {activeTab === 'cart' && (
                                <ShoppingCartTab
                                    cartItems={cartItems}
                                    setCartItems={setCartItems}
                                    onNext={handleNext}
                                    onCancel={handleCancel}
                                />
                            )}


                            {activeTab === 'shipping' && (
                                <ShippingDetailsTab
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    initialAddress={shippingAddress}
                                    onSaveAddress={setShippingAddress}
                                    initialShippingOption={selectedShipping}
                                    onSaveShippingOption={setSelectedShipping}
                                />
                            )}


                            {activeTab === 'payment' && (
                                <PaymentOptionsTab
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 w-full">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">Your Cart is Empty</h2>
                        <p className="mt-2 text-gray-500">Add products to your cart to start shopping.</p>
                        <button
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => window.location.href = '/'}
                        >
                            Go to Store
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;