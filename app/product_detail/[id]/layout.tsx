import SiteHeader from '@/components/SiteHeader/Header';

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <div id="main" className="flex justify-center py-6 bg-[#F7FAFC]">{children}</div>
    </>
  );
}