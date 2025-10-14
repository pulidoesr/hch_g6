// components/ProductCard.tsx
import Image from "next/image";

type ProductCardProps = {
  imageUrl?: string | null;
  description?: string;
  /** Price in BRL (preferred by UI) */
  price?: number;
  /** Raw price in cents (common in DB rows) */
  price_cents?: number;
  url_external?: string;
};

const centsToBRL = (c?: number | null) =>
  typeof c === "number" ? Math.round(c) / 100 : null;

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n
  );

export default function ProductCard({
  imageUrl,
  description,
  price,
  price_cents,
  url_external,
}: ProductCardProps) {
  // Prefer `price` (already BRL). Fallback to converting `price_cents`.
  const priceValue =
    typeof price === "number" ? price : centsToBRL(price_cents);

  const content = (
    <div className="block w-full h-full bg-white rounded-lg shadow hover:shadow-md overflow-hidden">
      {/* Image */}
      <div className="relative w-full h-48">
        <Image
          src={imageUrl || "/placeholder.png"}
          alt={description || "Product image"}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        {!!description && (
          <p className="text-gray-700 text-base">{description}</p>
        )}
        <p className="text-xl font-bold text-gray-900 mt-auto">
          {priceValue != null ? brl(priceValue) : "Price unavailable"}
        </p>
      </div>
    </div>
  );

  return url_external ? (
    <a href={url_external} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    content
  );
}
