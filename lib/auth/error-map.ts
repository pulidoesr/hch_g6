// lib/auth/error-map.ts
import { AuthError } from "next-auth";

export function mapAuthError(err: unknown): string {
  if (err instanceof AuthError) {
    switch (err.type) {
      case "CredentialsSignin":
        return "Invalid email or password.";
      case "AccessDenied":
        return "You don’t have access to this account.";
      case "CallbackRouteError":
        return "Could not complete sign-in. Try again.";
      default:
        return "Sign-in failed. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
