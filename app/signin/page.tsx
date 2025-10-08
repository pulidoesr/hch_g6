// app/signin/page.tsx
import { redirect } from "next/navigation";

export default function Page({ searchParams }: { searchParams?: { callbackUrl?: string } }) {
  const cb = searchParams?.callbackUrl ?? "/profile";
  redirect(`/profile?tab=signin&callbackUrl=${encodeURIComponent(cb)}`);
}
