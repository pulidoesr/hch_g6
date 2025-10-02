
import RandomCategoryGalleryServer from "@/components/RandomCategoryGallery/RandonCategoryGalleryServer";
import OfferCards from "@/components/OffersCard/OffersCard";

export default async function CollectionsPage() {
  return (
    <div>
      <RandomCategoryGalleryServer />
      <hr />
      <OfferCards />
    </div>
  );
}