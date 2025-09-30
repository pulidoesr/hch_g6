// lib/types/checkout.ts

export interface CartItem {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  imageSrc: string;
}

export interface CreditCardData {
    cardNumber: string;
    cardHolder: string;
    expirationDate: string;
    cvv: string;
}

export type PaymentMethod = 'creditCard' | 'paypal' | 'bankTransfer';

export interface SummaryCalculation {
    subtotal: number;
    shippingValue: number;
    taxes: number;
    total: number;
}

// Tipo de prop usado no componente SummaryTotals
export interface SummaryProps {
    summary: SummaryCalculation;
    shippingDisplay: string;
}