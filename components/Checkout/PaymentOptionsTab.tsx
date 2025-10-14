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

// IMPORTAÇÃO CORRETA:
// Importa saveOrder e as interfaces necessárias do seu módulo de servidor/actions.
// NOTA: Tivemos que tornar 'tax' opcional em OrderDataInput no data_bridge.ts para esta correção.
import { saveOrder, SaveOrderResult, OrderDataInput } from '@/lib/server/actions/data_bridge'; 


// --- NOVO HOOK PARA LER O LOCAL STORAGE (Mantido) ---
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
        console.error("Erro ao ler Local Storage (Frete):", error);
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
  
  // NOVOS ESTADOS PARA MENSAGEM E PROCESSAMENTO
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
    
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('creditCard');
  const [cardData, setCardData] = useState<CreditCardData>({
      cardNumber: '', cardHolder: '', expirationDate: '', cvv: ''
  });
  
  // 1. Load cart items
  const { cartItems } = useCart();

  const { shippingAddress } = useShippingAddress();

  // ✅ CORREÇÃO: Lê o valor FINAL do frete do Local Storage
  const storedShippingValue = useShippingValueFromLocalStorage(); 
  
  // 2. Determina o valor do frete usando o valor lido
  const shippingValue = storedShippingValue; 
  
  // 3. Define a string de exibição
  const shippingDisplay = shippingValue === 0 ? 'FREE' : `$${shippingValue.toFixed(2)}`;
  
  // 4. Calculate final summary using the utility function
  // O tipo de 'summary' é inferido do retorno de calculateSummary (SummaryCalculation)
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


  // --- FUNÇÃO DE SUBMISSÃO AJUSTADA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'creditCard' && Object.values(cardData).some(v => v === '')) {
        alert("Please fill in all credit card details.");
        return;
    }
    
    setIsProcessing(true); // Inicia o processamento

    try {
        // 1. LER DADOS DIRETAMENTE DO LOCAL STORAGE
        if (typeof window === 'undefined') {
            throw new Error("Local storage not available.");
        }
        
        // Use OrderDataInput (importado) para tipar o objeto.
        // Se 'tax' não está em 'summary', OrderDataInput DEVE ter 'tax' opcional no data_bridge.ts.
        const orderData: OrderDataInput = { 
            shippingValue: localStorage.getItem('checkout_shipping_value'),
            cartItems: localStorage.getItem('handcrafted_heaven_cart'),
            shippingAddress: localStorage.getItem('handcrafted_heaven_shipping_address'),
            paymentMethod: paymentMethod,
            cardData: paymentMethod === 'creditCard' ? cardData : null,
            // O TS aqui espera que 'summary' se encaixe no summary do OrderDataInput.
            // Isso só funcionará se 'tax' for opcional no OrderDataInput do data_bridge.ts.
            summary: summary as any, // Usamos 'as any' como fallback temporário para o caso do tipo ser complexo
        };

        // 2. CHAMAR A FUNÇÃO saveOrder DIRETAMENTE
        console.log("Saving order data to Data Bridge...");
        // O tipo de 'result' é SaveOrderResult
        const result: SaveOrderResult = await saveOrder(orderData); 
        
        if (result.success) {
            // 3. APRESENTAR MENSAGEM ELEGANTE
            setSuccessMessage(`Pedido #${result.orderId} realizado com sucesso! Redirecionando...`);
            
            // Opcional: Limpar o Local Storage após a compra
            localStorage.removeItem('checkout_shipping_value');
            localStorage.removeItem('handcrafted_heaven_cart');
            localStorage.removeItem('handcrafted_heaven_shipping_address');
            
            // 4. REDIRECIONAR APÓS 3 SEGUNDOS
            setTimeout(() => {
                router.push('/'); 
            }, 3000); 
        } else {
            throw new Error("Falha no pagamento ou na gravação do pedido.");
        }

    } catch (error) {
        console.error("Erro na submissão do pedido:", error);
        setSuccessMessage(null); // Remove qualquer mensagem pendente
        alert("Ocorreu um erro durante o pagamento. Tente novamente.");
        setIsProcessing(false); // Libera o botão
    }
  };
  
  const handleCancel = () => {
    router.push('/'); // Redireciona para a Home
  };


  return (
    <div className="max-w-7xl mx-auto py-8">
      
      {/* --- MENSAGEM DE SUCESSO ELEGANTE --- */}
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
                className={`w-full mt-8 bg-green-600 text-white py-3 px-8 
                    font-medium rounded-md shadow-lg
                    hover:bg-green-700 transition duration-200 flex justify-center items-center
                    ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`} // Estilo de desabilitado
                disabled={cartItems.length === 0 || isProcessing}
            >
                <DollarSign className='w-5 h-5 mr-2' />
                {isProcessing ? 'Processando...' : `Pagar $${summary.total.toFixed(2)}`}
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
                Voltar
            </button>
            <button
                type="button"
                onClick={handleCancel}
                className="
                    text-red-600 py-3 px-8 
                    font-medium rounded-sm hover:underline
                "
            >
                Cancelar
            </button>
        </div>
      </form>
    </div>
  );
}