// app/seller/products/[id]/edit/ui/EditForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  product: {
    id: string;
    title: string;
    description: string;
    price_cents: number;
    currency: string;
    slug: string;
    primary_image: string;
  };
};

export default function EditForm({ product }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(product);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await fetch(`/api/seller/products/${product.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          price_cents: Number(form.price_cents),
          currency: form.currency.toUpperCase(),
          slug: form.slug,
          primary_image: form.primary_image || null,
        }),
      });
      if (res.ok) {
        router.push("/seller");
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j?.error ?? "Update failed");
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <input
          className="border p-2 w-full"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Price (cents)"
          type="number"
          min={0}
          value={form.price_cents}
          onChange={(e) => setForm((f) => ({ ...f, price_cents: Number(e.target.value) }))}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Currency (e.g. USD)"
          value={form.currency}
          onChange={(e) =>
            setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))
          }
          maxLength={3}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Primary Image URL (optional)"
          value={form.primary_image}
          onChange={(e) => setForm((f) => ({ ...f, primary_image: e.target.value }))}
        />
        <div className="flex gap-3 pt-2">
          <button
            disabled={pending}
            className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => router.push("/seller")} className="px-4 py-2">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
