// components/InspirationSection/InspirationSectionWrapper.tsx
import InspirationSection from "./InspirationSection";
import type { Product } from "@/lib/types/product-data";
import { getAllProducts } from "@/lib/server/actions/data_bridge";

export const revalidate = 60; // optional

// NOTE: no "use client" here — this is a Server Component
export default async function InspirationSectionWrapper() {
  // ✅ Await DB call so we have Product[]
  const productsData: Product[] = await getAllProducts();

  return <InspirationSection productsData={productsData} />;
}
