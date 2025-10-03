// app/profile/page.tsx
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // Check session on server
  const session = await auth();

  if (!session) {
    // Not logged in → send user to signin
    redirect("../signin");
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {session.user?.name ?? session.user?.email}
      </h1>

      {/* Show user info for debugging */}
      <div className="rounded border p-4 bg-gray-50 text-sm text-gray-700">
        <p><strong>Email:</strong> {session.user?.email}</p>
        {session.user?.role && <p><strong>Role:</strong> {session.user.role}</p>}
      </div>

      {/* Logout form (server action) */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
