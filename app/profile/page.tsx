// app/profile/page.tsx
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl">
        Welcome, {session.user?.name ?? session.user?.email}
      </h1>

      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Sign out
        </button>
      </form>
    </main>
  );
}
