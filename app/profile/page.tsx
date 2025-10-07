// app/profile/page.tsx
import { auth, signOut } from "@/auth";
// import { redirect } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";

export const dynamic = "force-dynamic";

type SP = { callbackUrl?: string; tab?: "signin" | "signup" };

export default async function ProfilePage({ searchParams }: { searchParams: SP }) {
  const session = await auth();

  // If no session, render the unified AuthCard (Sign In / Sign Up)
  if (!session) {
    return (
      <div className="w-full max-w-lg mx-auto p-6">
        <AuthCard
          initialTab={searchParams?.tab ?? "signin"}
          callbackUrl={searchParams?.callbackUrl ?? "/profile"}
        />
      </div>
    );
  }

  // Signed-in view
  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <section className="w-full max-w-lg mx-auto p-8 space-y-6 rounded-lg bg-white/5 shadow">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {session.user?.name ?? session.user?.email}
      </h1>

      <div className="rounded border p-4 bg-gray-50 text-sm text-gray-700">
        <p><strong>Email:</strong> {session.user?.email}</p>
        {session.user?.role && <p><strong>Role:</strong> {session.user.role}</p>}
      </div>

      <form action={doSignOut}>
        <button className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
          Sign out
        </button>
      </form>
    </section>
  );
}
