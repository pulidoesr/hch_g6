'use client';

import { useState } from 'react';

export type SignInValues = { email: string; password: string };

export default function SignInForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (values: SignInValues) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ email, password });
      }}
      className="space-y-4"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border rounded px-3 py-2"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border rounded px-3 py-2"
        required
      />
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white rounded px-4 py-2"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
