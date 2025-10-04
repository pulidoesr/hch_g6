import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect('/signin?callbackUrl=/profile');

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <section className="w-full max-w-lg p-8 space-y-6 rounded-lg bg-white/5 shadow">
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
