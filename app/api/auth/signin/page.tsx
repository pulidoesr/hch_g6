import { signIn } from "@/auth"; // <- from your auth.ts
import Link from "next/link";

export default function SignInPage() {
  async function doSignIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    // NextAuth v5 API
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // where to go on success
    });
  }

  return (
    <main className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>

      <form action={doSignIn} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue="demo@example.com"
            className="border rounded p-2"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            defaultValue="pass123"
            className="border rounded p-2"
            required
          />
        </div>

        <button className="w-full rounded bg-black px-4 py-2 text-white">
          Sign in
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Try <code>demo@example.com</code> / <code>pass123</code> (from your <code>auth.ts</code>).
      </p>

      <p className="mt-2 text-sm">
        <Link href="/">Back home</Link>
      </p>
    </main>
  );
}
