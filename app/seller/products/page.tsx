import { notFound } from "next/navigation";
import ProductEditor from "@/components/ProductEditor/ProductEditor";
import { getProductById } from "@/lib/server/actions/data_bridge";

// Next 15: params is a Promise
type PageProps = { params: Promise<{ id: string }> };

export default async function SellerProductPage({ params }: PageProps) {
  const { id } = await params;              // ✅ await params
  const product = await getProductById(id); // ✅ await the product

  if (!product) return notFound();

  return (
    <ProductEditor
      key={id}                 // ✅ use the route param, not product.id
      initialProduct={product}
      isNew={false}
    />
  );
}
