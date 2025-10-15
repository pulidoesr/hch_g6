// app/seller/products/new/page.tsx
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ProductEditor from "@/components/ProductEditor/ProductEditor";

export default async function NewProductPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const sellerId = (session?.user as any)?.sellerId;

  // Only sellers with a sellerId can access
  if (!session || role !== "seller" || !sellerId) {
    notFound();
  }

  // Empty initial data for a new product
  return <ProductEditor initialProduct={{}} isNew={true} />;
}
