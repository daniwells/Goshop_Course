// Queries
import { getAllStoreProducts } from "@/queries/product";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getAllCategories } from "@/queries/category";

// UI Components
import DataTable from "@/components/ui/data-table";

// Icons
import { Plus } from "lucide-react";

// Custom Components
import ProductDetails from "@/components/dashboard/forms/product-details";

// Columns
import { columns } from "./columns";

export default async function SellerProductsPage({
  params
}: {
  params: {storeUrl: string}
}) {
  const resolvedParams = await params;
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();
  const products = await getAllStoreProducts(resolvedParams.storeUrl);

  return <DataTable
    actionButtonText={
      <>
        <Plus/>
        Create product
      </>
    }
    modalChildren={
      <ProductDetails 
        offerTags={offerTags}
        categories={categories}
        storeUrl={resolvedParams.storeUrl}
      />
    }
    newTabLink={`/dashboard/seller/stores/${resolvedParams.storeUrl}/products/new`}
    filterValue="name"
    data={products}
    columns={columns}
    searchPlaceholder="Search product name..."
  />
}