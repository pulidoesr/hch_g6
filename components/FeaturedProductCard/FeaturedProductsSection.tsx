import React from "react";
import FeaturedProductGallery from "./FeaturedProductCardGallery";
import { getAllProducts } from "@/lib/server/actions/data_bridge";

// (optional) cache this section for 60s
export const revalidate = 60;

export default async function FeaturedProductsSection() {
  // ✅ Await the Promise so we pass Product[] to the client component
  const allProducts = await getAllProducts();

  return <FeaturedProductGallery allProducts={allProducts} />;
}
