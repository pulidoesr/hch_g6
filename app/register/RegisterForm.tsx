"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAction, type RegisterResult } from "@/lib/server/actions/register";

const initialState: RegisterResult = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
    >
      {pending ? "Creating account..." : "Register"}
    </button>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.ok === false && state.formError && (
        <p className="rounded bg-red-50 text-red-700 p-2 text-sm">{state.formError}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input id="name" name="name" type="text" required className="mt-1 w-full border rounded p-2"/>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="mt-1 w-full border rounded p-2"/>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="mt-1 w-full border rounded p-2"/>
      </div>

      <SubmitButton />
    </form>
  );
}
