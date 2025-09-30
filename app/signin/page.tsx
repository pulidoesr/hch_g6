// app/signin/page.tsx
export const metadata = { title: "Sign in" };
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <SignInForm />
      <p className="text-sm mt-4">
         Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 underline">
          Register here
        </a>
      </p>

    </main>
  );
}
