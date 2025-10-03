// hooks/useCart.ts
'use client';

import { useState, useEffect } from 'react';

// Define o tipo exato que será salvo no localStorage
export interface CartItem {
    id: string; // ID do produto
    name: string;
    description: string;
    unitPrice: number;
    quantity: number;
    imageSrc: string; // Caminho da imagem (imageUrl do produto)
}

// Tipo simplificado para o produto a ser adicionado
export type ProductToAdd = Omit<CartItem, 'quantity'>;

const LOCAL_STORAGE_KEY = 'handcrafted_heaven_cart';

export const useCart = () => {
    // 1. Inicializa o estado lendo do Local Storage
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
            try {
                return storedCart ? JSON.parse(storedCart) : [];
            } catch (error) {
                console.error("Erro ao carregar o carrinho:", error);
                return [];
            }
        }
        return [];
    });

    // 2. Efeito colateral para salvar o carrinho sempre que ele mudar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems]);

    /**
     * Adiciona um novo item ao carrinho ou incrementa a quantidade se já existir.
     * @param product Os detalhes completos do produto a ser adicionado (exceto quantidade).
     */
    const addItem = (product: ProductToAdd) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                // Produto existe: incrementa a quantidade em 1
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1,
                };
                return updatedItems;
            } else {
                // Produto é novo: adiciona com quantidade 1
                const newItem: CartItem = {
                    ...product,
                    quantity: 1,
                };
                return [...prevItems, newItem];
            }
        });
    };
    
    // Adicione outras funções (removeItem, updateQuantity) conforme necessário
    return { cartItems, setCartItems, addItem };
};