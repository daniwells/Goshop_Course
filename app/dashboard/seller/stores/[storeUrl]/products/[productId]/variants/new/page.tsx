
// Custom components
import ProductDetails from "@/components/dashboard/forms/product-details";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import { getProductMainInfo } from "@/queries/product";

export default async function SellerNewProductVariantPage({
    params
}:{
    params: { storeUrl: string; productId: string }
}) {
    const resolvedParams = await params;
    
    const categories = await getAllCategories();
    const offerTags = await getAllOfferTags();
    const product = await getProductMainInfo(resolvedParams.productId);
    
    if(!product) return null;

    return <div>
        <ProductDetails
            categories={categories}
            offerTags={offerTags}
            data={product}
            storeUrl={resolvedParams.storeUrl}
        />
    </div>
}