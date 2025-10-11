// app/seller/products/[id]/page.tsx
import ProductEditor from "@/components/ProductEditor/ProductEditor";
import { getProductById } from "@/lib/server/actions/data_bridge";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function SellerProductPage({ params }: PageProps) {
  // Next 15 dynamic params are a Promise
  const { id } = await params;

  // ⬇️ this was missing
  const product = await getProductById(id);

  if (!product) return notFound();

  return (
    <ProductEditor
      key={product.id}           // now product is the resolved object
      initialProduct={product}
      isNew={false}
    />
  );
}
