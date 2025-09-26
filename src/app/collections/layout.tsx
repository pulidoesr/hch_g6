

export const metadata = {
  title: "Handcrafted Haven",
  description: "Marketplace for unique handmade items",
  icons: { icon: "/favicon.ico" }
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="main" className="flex justify-center py-6 bg-[#F7FAFC]">{children}</div>
  );
}