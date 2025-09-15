import "./../styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "Handcrafted Haven G6",
  description: "Marketplace for unique handmade items",
  icons: { icon: "/favicon.ico" }
}; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
        <header className="border-b">
          <nav className="container flex h-14 items-center justify-between">
            <Link href="/" className="font-semibold">Handcrafted Haven G6</Link>
            <div className="flex gap-4">
              <Link href="/products">Products</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </nav>
        </header>
        <main id="main" className="container py-6">{children}</main>
        <footer className="border-t mt-10">
          <div className="container py-6 text-sm text-gray-600">© {new Date().getFullYear()} Handcrafted Haven</div>
        </footer>
      </body>
    </html>
  );
}
