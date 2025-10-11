// app/product_detail/[id]/page.tsx
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import {
  getProductByIdWithDetails,
  getTopRatedSimilarProducts,
} from "@/lib/repositories/products";

export const revalidate = 60;

type Params = { id: string };
type MaybePromise<T> = T | Promise<T>;
type PageProps = { params: MaybePromise<Params> };

export default async function ProductPage({ params }: PageProps) {
  // ✅ Works on Next 14 (sync params) and Next 15 (async params)
  const { id } = await Promise.resolve(params);

  const [product, similarProducts] = await Promise.all([
    getProductByIdWithDetails(id),
    getTopRatedSimilarProducts(id, 6),
  ]);

  if (!product) return notFound();

  return <ProductClient product={product} similarProducts={similarProducts} />;
}

