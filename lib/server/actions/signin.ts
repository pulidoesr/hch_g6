// lib/server/actions/signin.ts 
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import type { SignInResult } from "@/lib/types/auth";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// 🔒 Type-safe guard for NEXT_REDIRECT
function isNextRedirectError(e: unknown): e is { digest: string } {
  if (typeof e !== "object" || e === null) return false;
  const digest = (e as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export async function signInAction(
  _prev: SignInResult,
  formData: FormData
): Promise<SignInResult> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      ok: false,
      fieldErrors: {
        email: issues.fieldErrors.email?.[0],
        password: issues.fieldErrors.password?.[0],
      },
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/profile",
    });
    return { ok: true };
  } catch (err) {
    // ✅ Properly detect Next.js redirect without `any`
    if (isNextRedirectError(err)) throw err;

    if (err instanceof AuthError && err.type === "CredentialsSignin") {
      return { ok: false, formError: "Invalid email or password." };
    }

    console.error("[signin] unexpected", err);
    return { ok: false, formError: "Sign-in failed. Please try again." };
  }
}
