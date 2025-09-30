// lib/checkout-utils.ts
'use client'; 

// Adiciona useEffect para persistência
import React, { useState, useEffect } from 'react'; 
// Supondo que você tenha CartItem e SummaryCalculation definidos em './types/checkout'
import { CartItem, SummaryCalculation } from './types/checkout'; 

// Constants (TODOS EXPORTADOS)
export const TAXES_RATE = 0.13; // 13% tax rate
export const SHIPPING_COST_PAID = 15.00; // Valor do frete
export const FREE_SHIPPING_THRESHOLD = 200.00; // Limite para frete grátis

const LOCAL_STORAGE_KEY = 'handcrafted_heaven_cart';

/**
 * Calculates the order summary based on cart items and shipping cost.
 */
export const calculateSummary = (items: CartItem[], shippingValue: number): SummaryCalculation => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
  // Taxes are calculated on the subtotal
  const calculatedTaxes = subtotal * TAXES_RATE; 

  const total = subtotal + shippingValue + calculatedTaxes;
  
  return { subtotal, shippingValue, taxes: calculatedTaxes, total };
};

/**
 * Hook to manage persistent cart state using Local Storage (Agora funcional).
 */
export const useCart = () => {
    
    // 1. Initialize state from Local Storage
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
            try {
                return storedCart ? JSON.parse(storedCart) : [];
            } catch (error) {
                console.error("Error loading cart from Local Storage:", error);
                return [];
            }
        }
        return [];
    });

    // 2. Effect to save cartItems to Local Storage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems]);
    
    return { cartItems, setCartItems };
};