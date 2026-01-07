import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
import ProductDetails from "@/components/dashboard/forms/product-details";
import { db } from "@/lib/db";

export default async function SellerNewProductPage({
    params
}: {
    params: {storeUrl: string}
}) {
    const resolvedParams = await params;
    const categories = await getAllCategories();
    const offerTags = await getAllOfferTags();
    const countries = await db.country.findMany({
        orderBy: {
            name: "asc",
        }
    });

    return <div className="w-full">
        <ProductDetails 
            categories={categories}
            storeUrl={resolvedParams.storeUrl}
            offerTags={offerTags}
            countries={countries}
        />
    </div>
}