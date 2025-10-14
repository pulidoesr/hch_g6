export type OrderLineInput = {
  productId: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderDataInput = {
  userId?: string | null;
  currency: string;           // e.g. "USD"
  totalCents: number;         // sum(lines)
  lines: OrderLineInput[];
  shippingAddressId?: string; // or inline address fields
  notes?: string;
};

export type SaveOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };
