// app/signin/page.tsx
'use client';
import SignInForm, { SignInValues } from './SignInForm';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get('callbackUrl') ?? '/profile';
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async ({ email, password }: SignInValues) => {
    setErr(null); setLoading(true);
    const res = await signIn('credentials', { redirect: false, email, password, callbackUrl });
    setLoading(false);
    if (res?.error) return setErr(res.error || 'Invalid credentials');
    router.replace(callbackUrl);
    router.refresh();
  };

  // The <main> from layout centers this box
  return (
    <div className="w-full max-w-md">
      <SignInForm onSubmit={handleSubmit} loading={loading} error={err} />
    </div>
  );
}
