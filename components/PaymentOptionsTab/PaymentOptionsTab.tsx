'use client';

import React, { useState, useMemo,useEffect } from 'react';
import { CreditCard, Truck, DollarSign } from 'lucide-react';

// --- Reusing Types and Hooks from Previous Interactions ---

interface CartItem {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  imageSrc: string;
}

export type ShippingOption = 'free' | 'express'; 

const LOCAL_STORAGE_KEY = 'checkout_shipping_value';
const DEFAULT_FALLBACK_VALUE = 0;

export function useShippingValueFromLocalStorage(): number {
  const [shippingValue, setShippingValue] = useState<number>(DEFAULT_FALLBACK_VALUE);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedValue) {
          const parsedValue = parseFloat(storedValue);
          
          if (!isNaN(parsedValue)) {
            setShippingValue(parsedValue);
          }
        }
      } catch (error) {
        console.error("Erro ao ler Local Storage:", error);
      }
    }
  }, []); 

  return shippingValue;
}

// Constants (Ajustadas para garantir que existam aqui ou sejam importadas)
const TAXES_RATE = 0.13; // 13% tax rate


// O calculateSummary precisa ser robusto o suficiente para calcular o frete
// com base na opção, ou o componente precisa passar o valor correto.
const calculateSummary = (items: CartItem[], shippingValue: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
  const calculatedTaxes = subtotal * TAXES_RATE; 

  const total = subtotal + shippingValue + calculatedTaxes;
  
  return { subtotal, shippingValue, taxes: calculatedTaxes, total };
};

// Simulation of useCart (Se for importado, remova este bloco)
const useCart = () => {
    // Retorna dados de exemplo
    const dummyItems: CartItem[] = [
        { id: 1, name: "Ceramic Vase", unitPrice: 45.00, quantity: 2, imageSrc: "/path/to/product1.png" },
        { id: 2, name: "Clay Pot", unitPrice: 15.00, quantity: 3, imageSrc: "/path/to/product2.png" },
    ];
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

// --- Payment Options Tab Component ---

export interface PaymentOptionsTabProps {
  onNext: () => void;
  onBack: () => void;
  selectedShippingOption: ShippingOption;  // Mantido, mas ignorado no cálculo final.
}

export default function PaymentOptionsTab({ onNext, onBack, selectedShippingOption }: PaymentOptionsTabProps) {
  const { cartItems } = useCart();
  
  // Lê o valor final do frete que foi armazenado na etapa anterior
  const storedShippingCost = useShippingValueFromLocalStorage(); 
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('creditCard');
  const [cardData, setCardData] = useState<CreditCardData>({
      cardNumber: '',
      cardHolder: '',
      expirationDate: '',
      cvv: '',
  });

  
  // ALTERAÇÃO CRUCIAL AQUI: Ignora selectedShippingOption e usa APENAS storedShippingCost
  const calculatedShippingValue = useMemo((): number => {
    // Se o valor foi calculado e armazenado como 0, é frete grátis.
    // Se foi armazenado como 15.00 (ou outro valor), é frete pago.
    return storedShippingCost; 
  }, [storedShippingCost]); // Dependência apenas do valor do Local Storage


  const summary = useMemo(
    () => calculateSummary(cartItems, calculatedShippingValue),
    [cartItems, calculatedShippingValue]
  );
  
  // A exibição é baseada no valor final: 0 = FREE, > 0 = Valor
  const shippingDisplay = calculatedShippingValue === 0 ? 'FREE' : `$${calculatedShippingValue.toFixed(2)}`;

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setCardData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Lógica de validação e processamento de pagamento viria aqui
      console.log('Payment details submitted:', { selectedMethod, cardData, summary });
      onNext();
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT: Payment Methods and Form */}
          <section className="lg:w-2/3">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Options</h2>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-8">
              {/* Credit Card Option */}
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  selectedMethod === 'creditCard'
                    ? 'border-amber-800 ring-2 ring-amber-500 bg-amber-50'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  checked={selectedMethod === 'creditCard'}
                  onChange={() => setSelectedMethod('creditCard')}
                  className="mr-4 h-5 w-5 text-amber-800 border-gray-300 focus:ring-amber-500"
                />
                <CreditCard className="w-6 h-6 mr-3 text-gray-700" />
                <span className="font-semibold text-lg text-gray-900">Credit Card</span>
              </label>

              {/* PayPal Option */}
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  selectedMethod === 'paypal'
                    ? 'border-amber-800 ring-2 ring-amber-500 bg-amber-50'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={selectedMethod === 'paypal'}
                  onChange={() => setSelectedMethod('paypal')}
                  className="mr-4 h-5 w-5 text-amber-800 border-gray-300 focus:ring-amber-500"
                />
                <DollarSign className="w-6 h-6 mr-3 text-gray-700" />
                <span className="font-semibold text-lg text-gray-900">PayPal</span>
              </label>

              {/* Bank Transfer Option (Example) */}
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  selectedMethod === 'bankTransfer'
                    ? 'border-amber-800 ring-2 ring-amber-500 bg-amber-50'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bankTransfer"
                  checked={selectedMethod === 'bankTransfer'}
                  onChange={() => setSelectedMethod('bankTransfer')}
                  className="mr-4 h-5 w-5 text-amber-800 border-gray-300 focus:ring-amber-500"
                />
                <Truck className="w-6 h-6 mr-3 text-gray-700" />
                <span className="font-semibold text-lg text-gray-900">Bank Transfer</span>
              </label>
            </div>

            {/* Credit Card Form (Visible only if selected) */}
            {selectedMethod === 'creditCard' && (
              <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Card Details</h3>
                
                <CardInput
                  id="cardHolder"
                  label="Card Holder Name"
                  type="text"
                  placeholder="John Doe"
                  value={cardData.cardHolder}
                  onChange={handleCardChange}
                />
                <CardInput
                  id="cardNumber"
                  label="Card Number"
                  type="text"
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19} // Incluindo espaços
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <CardInput
                    id="expirationDate"
                    label="Expiration Date (MM/YY)"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardData.expirationDate}
                    onChange={handleCardChange}
                  />
                  <CardInput
                    id="cvv"
                    label="CVV"
                    type="text"
                    placeholder="XXX"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={handleCardChange}
                  />
                </div>
              </div>
            )}
            
            {/* Outras informações/avisos dependendo do método */}
            {selectedMethod === 'paypal' && (
                <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                    You will be redirected to PayPal to complete your purchase.
                </div>
            )}

          </section>

          {/* RIGHT: Summary */}
          <section className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold tracking-wide mb-6">Order Summary</h2>
            <SummaryTotals summary={summary} shippingDisplay={shippingDisplay} />
          </section>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-200 text-gray-700 py-3 px-8 font-medium rounded-sm shadow-md hover:bg-gray-300 transition duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-[#7B3F00] text-white py-3 px-8 font-medium rounded-sm shadow-md hover:bg-[#633300] transition duration-200"
          >
            Pay Now
          </button>
        </div>
      </form>
    </div>
  );
}