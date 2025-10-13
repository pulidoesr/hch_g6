// lib/checkout-utils.ts
'use client'; 

// Adicionado useLayoutEffect para garantir o salvamento síncrono do endereço.
import React, { useState, useEffect, useLayoutEffect } from 'react'; 
// Assuming you have CartItem and SummaryCalculation defined in './types/checkout'
import { CartItem, SummaryCalculation} from './types/checkout'; 

// =========================================================================
// 1. SHIPPING ADDRESS INTERFACE (Exported for use in all components)
// This interface defines the persistent structure for shipping details.
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string; // Corresponds to 'address' in the shipping tab form
  address2: string;
  country: string; // Corresponds to 'country'/'state' in the shipping tab form
  city: string;
  zipCode: string;
  phoneNumber: string;
}

// =========================================================================

// Constants (ALL EXPORTED)
export const TAXES_RATE = 0.13; // 13% tax rate
export const SHIPPING_COST_PAID = 15.00; // Shipping cost value
export const FREE_SHIPPING_THRESHOLD = 200.00; // Free shipping threshold
export const EXPRESS_SHIPPING_COST = 15.00;

const LOCAL_STORAGE_KEY = 'handcrafted_heaven_cart';
const SHIPPING_ADDRESS_KEY = 'handcrafted_heaven_shipping_address';


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
 * Hook to manage persistent cart state using Local Storage.
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

// =========================================================================
// SHIPPING ADDRESS LOGIC WITH ROBUST INITIALIZATION
// =========================================================================

/**
 * Returns a complete and empty ShippingAddress object for safe initialization.
 */
const getEmptyShippingAddress = (): ShippingAddress => ({
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    country: '',
    city: '',
    zipCode: '',
    phoneNumber: '',
});

/**
 * Verifica se o objeto de endereço contém apenas valores vazios.
 * Usado para prevenir que o salvamento inicial ou resets do estado limpem os dados válidos.
 */
const isAddressEmpty = (address: ShippingAddress): boolean => {
    // Verifica se os campos obrigatórios estão vazios. address2 não precisa ser checado.
    return (
        !address.firstName &&
        !address.lastName &&
        !address.address &&
        !address.country &&
        !address.city &&
        !address.zipCode
    );
};

/**
 * Hook to manage the persistent shipping address state using Local Storage.
 * It ensures the state is always initialized with a valid object.
 */
export const useShippingAddress = () => {
    
    const [address, setAddress] = useState<ShippingAddress>(() => {
        
        if (typeof window !== 'undefined') {
            const storedAddress = localStorage.getItem(SHIPPING_ADDRESS_KEY);
            
            // Tratamento preventivo para a string literal "undefined"
            if (storedAddress === "undefined") {
                 localStorage.removeItem(SHIPPING_ADDRESS_KEY);
            }
            
            try {
                // Robust fallback: if no data exists or JSON is invalid, return a complete empty object.
                return storedAddress && storedAddress !== "undefined" ? JSON.parse(storedAddress) : getEmptyShippingAddress();
            } catch (error) {
                console.error("Error loading shipping address from Local Storage:", error);
                // In case of a parsing error (invalid JSON), return fallback
                return getEmptyShippingAddress();
            }
        }
        // Fallback for Server Side Rendering (SSR)
        return getEmptyShippingAddress();
    });

    
    useLayoutEffect(() => {
        if (typeof window !== 'undefined') {
            
            if (isAddressEmpty(address)) {
                  return; 
            }
            

            const jsonToSave = JSON.stringify(address);

            localStorage.setItem(SHIPPING_ADDRESS_KEY, jsonToSave);
        }
    }, [address]);
    
    return { shippingAddress: address, setShippingAddress: setAddress };
};