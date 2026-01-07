// Custom components
import ProductDetails from "@/components/dashboard/forms/product-details";
import { db } from "@/lib/db";

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
    const countries = await db.country.findMany({
        orderBy: {
            name: "asc",
        }
    });
    
    if(!product) return null;

    return <div>
        <ProductDetails
            categories={categories}
            offerTags={offerTags}
            data={product}
            storeUrl={resolvedParams.storeUrl}
            countries={countries}
        />
    </div>
}