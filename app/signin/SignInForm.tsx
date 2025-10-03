"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom"; // <-- add this
import { signInAction } from "@/lib/server/actions/signin";
import type { SignInResult } from "@/lib/types/auth";

const initialState: SignInResult = {
  ok: false,
  formError: undefined,
  fieldErrors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? "Signing in..." : ""}
      </span>
      <button type="submit" disabled={pending} >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </>
  );
}

export default function SignInForm() {
  const [state, formAction] = useActionState(signInAction, initialState); // no isPending here
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.ok === false && state.formError && (
        <p className="rounded bg-red-50 text-red-700 p-2 text-sm">
          {state.formError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className="mt-1 w-full border rounded p-2"
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          defaultValue="demo@example.com"
          required
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full border rounded p-2"
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          defaultValue="pass123"
          required
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
