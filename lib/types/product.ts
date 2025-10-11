// types/product.ts  (or lib/types/product.ts if that's your import path)
export type Review = {
  rating: number;
  date: string;          // ISO yyyy-mm-dd
  comment: string;
  customerName?: string | null;   // optional to handle missing data
  customerImage?: string | null;  // optional to handle missing data
};

export type Product = {
  id: string;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  name: string;
  price: number;
  rating: number;
  reviews: Review[];
};
