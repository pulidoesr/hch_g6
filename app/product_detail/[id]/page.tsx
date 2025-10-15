// app/product_detail/[id]/page.tsx (Server Component)
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { getProductByIdWithDetails, getTopRatedSimilarProducts } from "@/lib/repositories/products";

export const revalidate = 60;

type Params = { id: string };
type MaybePromise<T> = T | Promise<T>;
type PageProps = { params: MaybePromise<Params> };

export default async function ProductPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);

  const product = await getProductByIdWithDetails(id);
  if (!product) return notFound();

  // IMPORTANT: use the resolved UUID for similars
  const similarProducts = await getTopRatedSimilarProducts(product.id, 6);

  // ✅ Only pass plain data props
  return <ProductClient product={product} similarProducts={similarProducts} />;
}
