
import RandomCategoryGalleryServer from "@/components/RandomCategoryGallery/RandonCategoryGalleryServer";
import OfferCards from "@/components/OffersCard/OffersCard";
import InspirationSectionWrapper from "@/components/InspirationSection/InspirationSectionWrapper";
import FeaturedProductsSection from "@/components/FeaturedProductCard/FeaturedProductsSection";



export default async function CollectionsPage() {
  return (
    <div>
      <RandomCategoryGalleryServer />
      <hr />
      <OfferCards />
      <hr />
      <InspirationSectionWrapper />
      <hr />
      <FeaturedProductsSection />
    </div>
  );
}