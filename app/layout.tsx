// app/layout.tsx
import "@/styles/globals.css";
import Header from "@/components/SiteHeader/Header";
import Footer from "@/components/Footer/Footer";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

// or: export const dynamic = 'force-dynamic'
export const revalidate = 0;              
export const metadata = {
  title: "Handcrafted Haven",
  description: "Marketplace for unique handmade items",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth(); // server session

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <Header />               {/* <-- render it */}
          {children}
          <Footer />               {/* <-- and this */}
        </SessionProvider>
      </body>
    </html>
  );
}
