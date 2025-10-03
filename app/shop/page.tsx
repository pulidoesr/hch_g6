
import RandomCategoryGalleryServer from "@/components/RandomCategoryGallery/RandonCategoryGalleryServer";
import OfferCards from "@/components/OffersCard/OffersCard";
import InspirationSectionWrapper from "@/components/InspirationSection/InspirationSectionWrapper";

export default async function CollectionsPage() {
  return (
    <div>
      <RandomCategoryGalleryServer />
      <hr />
      <OfferCards />
      <hr />
      <InspirationSectionWrapper />
    </div>
  );
}