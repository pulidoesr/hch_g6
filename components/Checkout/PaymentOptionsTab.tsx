// src/components/checkout/PaymentOptionsTab.tsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Truck, DollarSign, CheckCircle } from 'lucide-react'; 
import { useRouter } from 'next/navigation'; 

// Imports logic and hooks from checkout-utils
import { useCart, calculateSummary, useShippingAddress } from '@/lib/checkout-utils'; 
// Imports types
import { CreditCardData, PaymentMethod } from '@/lib/types/checkout';
 

// Imports subcomponents
import SummaryTotals from './SummaryTotals';
import CardInput from '../Common/CardInput';


import type { SaveOrderResult, OrderDataInput } from "@/lib/shared/order-types";

async function placeOrder(order: OrderDataInput): Promise<SaveOrderResult> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(order),
  });
  const out = (await res.json()) as SaveOrderResult;
  return out;
}



// --- NEW HOOK TO READ LOCAL STORAGE (Kept) ---
const LOCAL_STORAGE_KEY_SHIPPING = 'checkout_shipping_value';
const DEFAULT_FALLBACK_VALUE = 0;

export function useShippingValueFromLocalStorage(): number {
  const [shippingValue, setShippingValue] = useState<number>(DEFAULT_FALLBACK_VALUE);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY_SHIPPING);
        
        if (storedValue) {
          const parsedValue = parseFloat(storedValue);
          
          if (!isNaN(parsedValue)) {
            setShippingValue(parsedValue);
          }
        }
      } catch (error) {
        // Translation: "Erro ao ler Local Storage (Frete):" -> "Error reading Local Storage (Shipping):"
        console.error("Error reading Local Storage (Shipping):", error);
      }
    }
  }, []); 

  return shippingValue;
}
// ------------------------------------------


interface PaymentOptionsTabProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentOptionsTab({ onNext, onBack }: PaymentOptionsTabProps) {
  const router = useRouter(); 
  
 
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
    
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('creditCard');
  const [cardData, setCardData] = useState<CreditCardData>({
      cardNumber: '', cardHolder: '', expirationDate: '', cvv: ''
  });
  
  // 1. Load cart items
  const { cartItems } = useCart();

  const { shippingAddress } = useShippingAddress();

  // Reads the FINAL shipping value from Local Storage
  const storedShippingValue = useShippingValueFromLocalStorage(); 
  
  // 2. Determines the shipping value using the read value
  const shippingValue = storedShippingValue; 
  
  // 3. Defines the display string
  const shippingDisplay = shippingValue === 0 ? 'FREE' : `$${shippingValue.toFixed(2)}`;
  
  // 4. Calculate final summary using the utility function
  // The type of 'summary' is inferred from the return of calculateSummary (SummaryCalculation)
  const summary = useMemo(() => calculateSummary(cartItems, shippingValue), [cartItems, shippingValue]);
  
  const formattedAddress = useMemo(() => {
    const { address, city, zipCode, country } = shippingAddress; 
    
    if (address && city && zipCode) {
        return `${address}, ${city}, ${country} ${zipCode}`;
    }
    return 'Not specified (Please go back to Shipping)';
  }, [shippingAddress]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (paymentMethod === "creditCard" && Object.values(cardData).some(v => v === "")) {
    alert("Please fill in all credit card details.");
    return;
  }

  setIsProcessing(true);

  try {
    if (typeof window === "undefined") throw new Error("Local storage not available.");

    // Read raw values from localStorage
    const rawCart = localStorage.getItem("handcrafted_heaven_cart") ?? "[]";
    const rawShippingAddr = localStorage.getItem("handcrafted_heaven_shipping_address") ?? "{}";
    const rawShippingValue = localStorage.getItem("checkout_shipping_value") ?? "0";

    // Parse and normalize to a clean OrderDataInput for the API
    const cart = JSON.parse(rawCart) as Array<{ id: number; name: string; unitPrice: number; quantity: number }>;
    const shippingValueNum = Number(rawShippingValue) || 0;

    // If your shared OrderDataInput follows the “lines/totalCents” model:
    const orderData: OrderDataInput = {
      // userId: (optional) attach from session if you have it
      currency: "USD",
      totalCents: Math.round(summary.total * 100),
      lines: cart.map(i => ({
        productId: String(i.id),
        quantity: i.quantity,
        unitPriceCents: Math.round(i.unitPrice * 100),
      })),
      // You can pass extra context in notes until you model it in DB:
      notes: JSON.stringify({
        paymentMethod,
        cardData: paymentMethod === "creditCard" ? cardData : null,
        shippingAddress: JSON.parse(rawShippingAddr),
        shippingValue: shippingValueNum,
        uiTotals: summary, // for debugging
      }),
    };

    const result = await placeOrder(orderData);

    if (result.ok) {
      setSuccessMessage(`Order #${result.orderId} placed successfully! Redirecting...`);

      // Clear Local Storage after purchase
      localStorage.removeItem("checkout_shipping_value");
      localStorage.removeItem("handcrafted_heaven_cart");
      localStorage.removeItem("handcrafted_heaven_shipping_address");

      setTimeout(() => router.push("/"), 3000);
    } else {
      throw new Error(result.error || "Payment failed or order recording failed.");
    }
  } catch (error) {
    console.error("Error in order submission:", error);
    setSuccessMessage(null);
    alert("An error occurred during payment. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};

  
  const handleCancel = () => {
    router.push('/'); 
  };


  return (
    <div className="max-w-7xl mx-auto py-8">
      
      
      {successMessage && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 text-center shadow-lg flex items-center justify-center space-x-3">
              <CheckCircle className="w-6 h-6" />
              <p className="font-semibold">{successMessage}</p>
          </div>
      )}
      {/* ------------------------------------- */}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- PAYMENT SECTION (LEFT) --- */}
          <section className="lg:w-2/3">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Options</h2>
            
            {/* --- PAYMENT METHOD SELECTION --- */}
            {/* ... Payment button options ... */}


            {/* --- CREDIT CARD FORM (Conditional) --- */}
            {paymentMethod === 'creditCard' && (
                <div className="p-6 border rounded-lg shadow-md bg-white">
                    <h3 className="text-xl font-semibold mb-4">Credit Card Details</h3>
                    
                    <CardInput 
                        id="cardNumber" 
                        label="Card Number" 
                        type="tel"
                        name="cardNumber" 
                        placeholder="xxxx xxxx xxxx xxxx" 
                        value={cardData.cardNumber} 
                        onChange={handleCardChange} 
                        maxLength={19}
                    />
                    
                    <CardInput 
                        id="cardHolder" 
                        label="Card Holder Name" 
                        type="text" 
                        name="cardHolder" 
                        placeholder="Ex: John Doe" 
                        value={cardData.cardHolder} 
                        onChange={handleCardChange} 
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <CardInput 
                            id="expirationDate" 
                            label="Expiration Date" 
                            type="text" 
                            name="expirationDate" 
                            placeholder="MM/YY" 
                            value={cardData.expirationDate} 
                            onChange={handleCardChange} 
                            maxLength={5}
                        />
                        <CardInput 
                            id="cvv" 
                            label="CVV" 
                            type="text" 
                            name="cvv" 
                            placeholder="123" 
                            value={cardData.cvv} 
                            onChange={handleCardChange} 
                            maxLength={4}
                        />
                    </div>
                </div>
            )}
            
          </section>

          {/* --- SUMMARY SECTION (RIGHT) --- */}
          <section className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-2xl font-bold tracking-wide mb-6">Summary</h2>
            
            <div className="flex items-center text-sm mb-4 border-b pb-4">
                <Truck className="w-5 h-5 mr-2 text-gray-500" />
                <span className='font-medium'>Shipping to:</span> 
                <span className='ml-2 text-gray-600'>{formattedAddress}</span>
            </div>

            {/* Totals Component */}
            <SummaryTotals summary={summary} shippingDisplay={shippingDisplay} />

            <button
                type="submit"
                className={`w-full mt-8 bg-green-600 text-white py-3 px-8 
                    font-medium rounded-md shadow-lg
                    hover:bg-green-700 transition duration-200 flex justify-center items-center
                    ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={cartItems.length === 0 || isProcessing}
            >
                <DollarSign className='w-5 h-5 mr-2' />
                {isProcessing ? 'Processing...' : `Pay $${summary.total.toFixed(2)}`}
            </button>
          </section>
        </div>

        {/* --- NAVIGATION BUTTONS (BOTTOM) --- */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-center  gap-6">
            <button
                type="button"
                onClick={onBack}
                className="
                    bg-gray-200 text-gray-700 h-12 w-30 
                    font-medium rounded-sm shadow-md
                    hover:bg-gray-300 transition duration-200
                "
            >
                Back
            </button>
            <button
                type="button"
                onClick={handleCancel}
                className="
                    text-red-600 h-12 w-30 
                    font-medium rounded-sm hover:underline
                "
            >
                
                Cancel
            </button>
        </div>
      </form>
    </div>
  );
}