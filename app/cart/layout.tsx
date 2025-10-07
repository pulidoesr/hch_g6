
import SiteHeader from '@/components/SiteHeader/Header';

export const metadata = {
  title: "Handcrafted Haven",
  description: "Shopping Cart",
  icons: { icon: "/favicon.ico" }
};

export default function Cart({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div id="main" className="flex justify-center py-6 bg-[#F7FAFC]">{children}</div>
    </>
  );
}
