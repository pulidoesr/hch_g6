import "@/styles/globals.css"
import Header from "@/components/SiteHeader/Header"
import Footer from "@/components/Footer/Footer"
import PageFrame from "@/components/PageFrame"
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-[#E9E7F6]">
        <SessionProvider session={session}>
          <Header />
          <PageFrame>{children}</PageFrame>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
