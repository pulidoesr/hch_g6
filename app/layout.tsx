import "@/styles/globals.css"
import Header from "@/components/SiteHeader/Header"
import Footer from "@/components/Footer/Footer"

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
