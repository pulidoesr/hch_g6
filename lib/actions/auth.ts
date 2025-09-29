// lib/actions/auth.ts
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

type FieldErrors = Partial<Record<"email" | "password", string>>;

type SignInStateBase = {
  formError?: string;
  fieldErrors?: FieldErrors;
};

export type SignInResult =
  | ({ ok: true; redirect?: string } & SignInStateBase)
  | ({ ok: false } & SignInStateBase);

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export async function signInAction(
  _prev: SignInResult,
  formData: FormData
): Promise<SignInResult> {
  "use server";

  const parsed = LoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      ok: false,
      formError: undefined,
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
    return { ok: true, redirect: "/profile", formError: undefined, fieldErrors: undefined };
  } catch (err) {
    return {
      ok: false,
      formError:
        err instanceof AuthError && err.type === "CredentialsSignin"
          ? "Invalid email or password."
          : "Sign-in failed. Please try again.",
      fieldErrors: undefined,
    };
  }
}
