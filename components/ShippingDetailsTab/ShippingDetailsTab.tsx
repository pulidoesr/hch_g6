'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronDown, Check, Truck, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Reutilizaçãos de Tipos e Hooks da Interação Anterior ---

// NOTE: Certifique-se de que CartItem, useCart, calculateSummary e os Hooks
// de Navegação (onNext, onBack) estão acessíveis ou definidos globalmente.

interface CartItem {
  id: number;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
  imageSrc: string;
}

// Simulação do useCart (Substitua pela sua importação real)
const LOCAL_STORAGE_KEY = 'handcrafted_heaven_cart';
const useCart = () => {
    // ... (Definição completa do useCart com useEffect e useState lendo do localStorage)
    if (typeof window === 'undefined') return { cartItems: [] as CartItem[], setCartItems: () => {} };
    // Para simplificar, retorna apenas a leitura inicial
    const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    const cartItems = storedCart ? JSON.parse(storedCart) : [];
    return { cartItems: cartItems as CartItem[], setCartItems: () => {} };
};

// Constantes
const TAXES = 13.00;
const FREE_SHIPPING_THRESHOLD = 200.00;
const SHIPPING_COST = 20.00;
const EXPRESS_SHIPPING_COST = 15.00; // Custo de Next Day Delivery

const calculateSummary = (items: CartItem[], shippingValue: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
  // As taxas são calculadas sobre o subtotal
  const calculatedTaxes = subtotal * (TAXES / 100); 

  const total = subtotal + shippingValue + calculatedTaxes;
  
  return { subtotal, shippingValue, taxes: calculatedTaxes, total };
};

const COUNTRIES = ['Brazil', 'United States', 'Canada', 'United Kingdom', 'Germany'];

// --- Tipagens do Formulário ---

interface FormData {
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  country: string;
  city: string;
  zipCode: string;
  phoneNumber: string;
}

type ShippingOption = 'free' | 'express';

// --- Subcomponentes ---

/**
 * Componente Reutilizável de Input com Label obrigatório e placeholder
 */
const FormField: React.FC<{
  id: keyof FormData;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
  fullWidth?: boolean;
  validationError?: string;
}> = ({ id, label, type = 'text', placeholder, value, onChange, options, fullWidth = false, validationError }) => {
  const isSelect = type === 'select' && options;
  const colSpan = fullWidth ? 'col-span-full' : 'col-span-1';
  
  return (
    <div className={`flex flex-col mb-4 ${colSpan}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      
      {isSelect ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required
          className={`w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 ${validationError ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 ${validationError ? 'border-red-500' : 'border-gray-300'}`}
        />
      )}
      {validationError && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
    </div>
  );
};


/**
 * Item de Produto no Summary
 */
const SummaryProductItem: React.FC<{ item: CartItem }> = ({ item }) => {
  const itemTotal = item.unitPrice * item.quantity;
  return (
    <div className="flex items-start py-4 border-b border-gray-100">
      {/* Foto */}
      <div className="w-16 h-16 flex-shrink-0 relative mr-4">
        <Image
          src={item.imageSrc}
          alt={item.name}
          fill
          sizes="64px"
          className="object-cover rounded-md"
        />
      </div>
      
      {/* Detalhes */}
      <div className="flex-grow flex justify-between items-start">
        <div>
          <p className="font-medium text-sm text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
        </div>
        <p className="font-semibold text-sm text-gray-900">${itemTotal.toFixed(2)}</p>
      </div>
    </div>
  );
};


// --- Componente Principal ---

interface ShippingDetailsTabProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ShippingDetailsTab({ onNext, onBack }: ShippingDetailsTabProps) {
  const router = useRouter();
  const { cartItems } = useCart();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', address: '', address2: '',
    country: '', city: '', zipCode: '', phoneNumber: ''
  });
  
  const [shippingOption, setShippingOption] = useState<ShippingOption>('free');
  const [showVoucher, setShowVoucher] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});


  const selectedShippingValue = useMemo(() => {
    // Calcula o subtotal do carrinho para verificar o frete grátis
    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    if (shippingOption === 'free') {
      // Free Shipping padrão: grátis se acima do limite, senão usa o custo padrão
      return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    } else {
      // Next Day Delivery
      return EXPRESS_SHIPPING_COST;
    }
  }, [shippingOption, cartItems]);
  
  const summary = useMemo(() => calculateSummary(cartItems, selectedShippingValue), [cartItems, selectedShippingValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar o erro ao digitar
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Validação de Frontend (Simples)
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;
    const phoneRegex = /^\+?(\d[\d\s-()]{6,15})?$/; // Regex simples para número de telefone

    // Validação de campos obrigatórios
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      if (!formData[field] && field !== 'address2') {
        newErrors[field] = 'Este campo é obrigatório.';
        isValid = false;
      }
    });

    // Validação de telefone
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Formato de telefone inválido.';
        isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulação de envio para o Backend / Próxima etapa
      console.log('Dados de envio validados:', formData);
      onNext();
    } else {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- SEÇÃO DO FORMULÁRIO (ESQUERDA) --- */}
          <section className="lg:w-2/3">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Shipping Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linha 1: First Name e Last Name */}
              <FormField 
                id="firstName" label="First Name" placeholder="First Name" 
                value={formData.firstName} onChange={handleChange} validationError={errors.firstName}
              />
              <FormField 
                id="lastName" label="Last Name" placeholder="Last Name" 
                value={formData.lastName} onChange={handleChange} validationError={errors.lastName}
              />
              
              {/* Linha 2: Address (Full Width) */}
              <FormField 
                id="address" label="Address" placeholder="Address" fullWidth 
                value={formData.address} onChange={handleChange} validationError={errors.address}
              />
              
              {/* Linha 3: Address 2 (Full Width) */}
              <FormField 
                id="address2" label="Address 2 (Optional)" placeholder="Address 2" fullWidth 
                value={formData.address2} onChange={handleChange}
              />
              
              {/* Linha 4: Country e City */}
              <FormField 
                id="country" label="Country" placeholder="Country" type="select" options={COUNTRIES}
                value={formData.country} onChange={handleChange} validationError={errors.country}
              />
              <FormField 
                id="city" label="City" placeholder="City" 
                value={formData.city} onChange={handleChange} validationError={errors.city}
              />
              
              {/* Linha 5: Zip Code e Phone Number */}
              <FormField 
                id="zipCode" label="Zip Code" placeholder="Zip Code" 
                value={formData.zipCode} onChange={handleChange} validationError={errors.zipCode}
              />
              <FormField 
                id="phoneNumber" label="Phone Number" placeholder="Phone Number" type="tel"
                value={formData.phoneNumber} onChange={handleChange} validationError={errors.phoneNumber}
              />
            </div>
            
            {/* Separador */}
            <hr className="my-8 border-gray-300" />

            {/* --- OPÇÕES DE ENVIO (RADIO BUTTONS) --- */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipping Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Opção 1: Free Shipping / Standard */}
                <div 
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                        shippingOption === 'free' ? 'border-amber-800 ring-2 ring-amber-500' : 'border-gray-300 hover:border-gray-500'
                    }`}
                    onClick={() => setShippingOption('free')}
                >
                    <input 
                        type="radio" 
                        name="shipping" 
                        value="free" 
                        checked={shippingOption === 'free'} 
                        onChange={() => setShippingOption('free')}
                        className="mr-3 h-4 w-4 text-amber-800 border-gray-300 focus:ring-amber-500"
                    />
                    <label className="inline-flex flex-col">
                        <span className="font-semibold text-lg text-gray-900">
                            Free Shipping
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                            Between 2-5 working days
                        </span>
                    </label>
                </div>

                {/* Opção 2: Next Day Delivery */}
                <div 
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                        shippingOption === 'express' ? 'border-amber-800 ring-2 ring-amber-500' : 'border-gray-300 hover:border-gray-500'
                    }`}
                    onClick={() => setShippingOption('express')}
                >
                    <input 
                        type="radio" 
                        name="shipping" 
                        value="express" 
                        checked={shippingOption === 'express'} 
                        onChange={() => setShippingOption('express')}
                        className="mr-3 h-4 w-4 text-amber-800 border-gray-300 focus:ring-amber-500"
                    />
                    <label className="inline-flex flex-col">
                        <span className="font-semibold text-lg text-gray-900">
                            Next Day Delivery - ${EXPRESS_SHIPPING_COST.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                            24 hours from checkout
                        </span>
                    </label>
                </div>
            </div>
          </section>

          {/* --- SEÇÃO SUMMARY (DIREITA) --- */}
          <section className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold tracking-wide mb-6">Summary</h2>
            
            {/* Lista de Itens do Carrinho */}
            <div className="mb-6 max-h-96 overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map(item => <SummaryProductItem key={item.id} item={item} />)
              ) : (
                <p className="text-gray-500 text-sm">Seu carrinho está vazio.</p>
              )}
            </div>

            {/* Separador */}
            <hr className="my-6 border-gray-200" />

            {/* Seção Voucher */}
            <div className="mb-6">
                <button 
                    type="button"
                    onClick={() => setShowVoucher(!showVoucher)}
                    className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 font-medium py-2"
                >
                    <span>Have a Voucher?</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showVoucher ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                {showVoucher && (
                    <div className="mt-3">
                        <input
                            type="text"
                            placeholder="Enter Voucher Code"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 border-gray-300"
                        />
                    </div>
                )}
            </div>

            {/* Separador */}
            <hr className="my-6 border-gray-200" />

            {/* Totais do Summary */}
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-gray-600">SubTotal</span>
                <span className="font-medium">${summary.subtotal.toFixed(2)}</span>
              </div>
              
              {/* Shipping */}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                    {summary.shippingValue === 0 ? 'FREE' : `$${summary.shippingValue.toFixed(2)}`}
                </span>
              </div>

              {/* Taxes */}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes ({TAXES}%)</span>
                <span className="font-medium">${summary.taxes.toFixed(2)}</span>
              </div>

              {/* Separador */}
              <hr className="my-3 border-gray-300" />
              
              {/* Total */}
              <div className="flex justify-between pt-2">
                <span className="text-xl font-bold">TOTAL</span>
                <span className="text-2xl font-bold text-amber-800">${summary.total.toFixed(2)}</span>
              </div>
            </div>
            
          </section>
        </div>

        {/* --- BOTÕES DE NAVEGAÇÃO (INFERIOR) --- */}
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
            <div className='space-x-4'>
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
                <button
                    type="submit" // Usar type="submit" para que a validação frontend seja acionada
                    className="
                        bg-[#7B3F00] text-white py-3 px-8 
                        font-medium rounded-sm shadow-md
                        hover:bg-[#633300] transition duration-200
                    "
                >
                    Next
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}