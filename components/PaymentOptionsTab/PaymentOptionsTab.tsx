'use client';

import React, { useState, useMemo } from 'react';
import { CreditCard, Truck, DollarSign } from 'lucide-react';

// --- Reusing Types and Hooks from Previous Interactions ---

interface CartItem {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  imageSrc: string;
}

// Constants
const TAXES_RATE = 0.13; // 13% tax rate
const SHIPPING_COST_PAID = 15.00; 
const FREE_SHIPPING_THRESHOLD = 200.00;

const calculateSummary = (items: CartItem[], shippingValue: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
  // Taxes are calculated on the subtotal
  const calculatedTaxes = subtotal * TAXES_RATE; 

  const total = subtotal + shippingValue + calculatedTaxes;
  
  return { subtotal, shippingValue, taxes: calculatedTaxes, total };
};

// Simulation of useCart (Replace with your actual import: import { useCart } from '../hooks/useCart')
const useCart = () => {
    // Returns dummy data for demonstration
    const dummyItems: CartItem[] = [
        { id: 1, name: "Ceramic Vase", unitPrice: 45.00, quantity: 2, imageSrc: "/path/to/product1.png" },
        { id: 2, name: "Clay Pot", unitPrice: 15.00, quantity: 3, imageSrc: "/path/to/product2.png" },
    ];
    // In a real application, you would load from localStorage here.
    return { cartItems: dummyItems, setCartItems: () => {} };
};

// Credit Card Form Types
interface CreditCardData {
    cardNumber: string;
    cardHolder: string;
    expirationDate: string;
    cvv: string;
}

type PaymentMethod = 'creditCard' | 'paypal' | 'bankTransfer';

// --- UI Helper Components ---

/**
 * Component for displaying the order totals (SubTotal, Shipping, Taxes, Total).
 */
interface SummaryProps {
    summary: ReturnType<typeof calculateSummary>;
    shippingDisplay: string;
}

const SummaryTotals: React.FC<SummaryProps> = ({ summary, shippingDisplay }) => {
    const { subtotal, taxes, total } = summary;

    const SummaryRow: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass = '' }) => (
        <div className="flex justify-between mb-2">
            <span className="text-gray-600">{label}</span>
            <span className={`font-medium ${valueClass}`}>
                {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
            </span>
        </div>
    );

    return (
        <div className="space-y-3 pt-4">
            <SummaryRow label="SubTotal" value={subtotal} />
            
            {/* Shipping */}
            <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-medium ${shippingDisplay === 'FREE' ? 'text-green-600' : ''}`}>
                    {shippingDisplay}
                </span>
            </div>

            <SummaryRow label={`Taxes (${(TAXES_RATE * 100).toFixed(0)}%)`} value={taxes} />

            <hr className="my-3 border-gray-300" />
            
            {/* Total */}
            <div className="flex justify-between pt-2">
                <span className="text-xl font-bold">TOTAL</span>
                <span className="text-2xl font-bold text-amber-800">${total.toFixed(2)}</span>
            </div>
        </div>
    );
};

/**
 * Reusable input component for the credit card form.
 */
const CardInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div className="flex flex-col mb-4">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
            {label} <span className="text-red-500">*</span>
        </label>
        <input
            id={id}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 border-gray-300"
            {...props}
        />
    </div>
);