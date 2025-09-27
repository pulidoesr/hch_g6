import "@/styles/globals.css"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"

export const metadata = {
  title: "Handcrafted Haven",
  description: "Marketplace for unique handmade items",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header/>
        <main id="main" className="flex justify-center py-6 bg-[#F7FAFC]">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
