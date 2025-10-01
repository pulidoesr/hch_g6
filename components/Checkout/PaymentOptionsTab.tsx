// src/components/checkout/PaymentOptionsTab.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { CreditCard, Truck, DollarSign } from 'lucide-react';

// Imports logic and hooks from checkout-utils
import { useCart, calculateSummary, FREE_SHIPPING_THRESHOLD, SHIPPING_COST_PAID, useShippingAddress, ShippingAddress } from '@/lib/checkout-utils'; 
// Imports types
import { CreditCardData, PaymentMethod } from '@/lib/types/checkout'; 

// Imports subcomponents
import SummaryTotals from './SummaryTotals';
import CardInput from '../Common/CardInput';


interface PaymentOptionsTabProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentOptionsTab({ onNext, onBack }: PaymentOptionsTabProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('creditCard');
  const [cardData, setCardData] = useState<CreditCardData>({
      cardNumber: '', cardHolder: '', expirationDate: '', cvv: ''
  });
  
  // 1. Load cart items
  const { cartItems } = useCart();

  const { shippingAddress } = useShippingAddress();
  
  // 2. Calculate shipping cost
  const shippingValue = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) >= FREE_SHIPPING_THRESHOLD 
    ? 0 : SHIPPING_COST_PAID;
  const shippingDisplay = shippingValue === 0 ? 'FREE' : `$${shippingValue.toFixed(2)}`;
  
  // 3. Calculate final summary using the utility function
  const summary = useMemo(() => calculateSummary(cartItems, shippingValue), [cartItems, shippingValue]);
  const formattedAddress = useMemo(() => {
    // Garantido que shippingAddress não é undefined e tem as propriedades (graças ao hook robusto)
    const { street, city, zipCode, country } = shippingAddress; 
    
    // Retorna uma string formatada, ou um placeholder se os dados ainda estiverem vazios
    if (street && city && zipCode) {
        return `${street}, ${city}, ${country} ${zipCode}`;
    }
    return 'Not specified (Please go back to Shipping)';
  }, [shippingAddress]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'creditCard' && Object.values(cardData).some(v => v === '')) {
        alert("Please fill in all credit card details.");
        return;
    }
    console.log(`Processing payment with ${paymentMethod}...`);
    // On success:
    // onNext(); 
  };
  
  const handleCancel = () => {
    // Implement navigation back to the Home page
    console.log('Cancelling and navigating back to Home.');
  };


  return (
    <div className="max-w-7xl mx-auto py-8">
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- PAYMENT SECTION (LEFT) --- */}
          <section className="lg:w-2/3">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Options</h2>
            
            {/* --- PAYMENT METHOD SELECTION --- */}
            <div className="flex space-x-4 mb-8">
                {/* Payment button options omitted for brevity, but should use setPaymentMethod */}
            </div>


            {/* --- CREDIT CARD FORM (Conditional) --- */}
            {paymentMethod === 'creditCard' && (
                <div className="p-6 border rounded-lg shadow-md bg-white">
                    <h3 className="text-xl font-semibold mb-4">Credit Card Details</h3>
                    
                    {/* ❌ ERROR FIXED: Card Number */}
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
                    
                    {/* ❌ ERROR FIXED: Card Holder Name */}
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
                        {/* ❌ ERROR FIXED: Expiration Date */}
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
                        {/* ❌ ERROR FIXED: CVV */}
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
            
            {/* ... other payment methods placeholder ... */}
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
                className="w-full mt-8 bg-green-600 text-white py-3 px-8 
                    font-medium rounded-md shadow-lg
                    hover:bg-green-700 transition duration-200 flex justify-center items-center"
                disabled={cartItems.length === 0}
            >
                <DollarSign className='w-5 h-5 mr-2' />
                Pay ${summary.total.toFixed(2)}
            </button>
          </section>
        </div>

        {/* --- NAVIGATION BUTTONS (BOTTOM) --- */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
            <button
                type="button"
                onClick={onBack}
                className="
                    bg-gray-200 text-gray-700 py-3 px-8 
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
                    text-red-600 py-3 px-8 
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