import { getAllCategories } from "@/queries/category";
import ProductDetails from "@/components/dashboard/forms/product-details";

export default async function SellerNewProductPage({
    params
}: {
    params: {storeUrl: string}
}) {
    const resolvedParams = await params;
    const categories = await getAllCategories();

    return <div className="w-full">
        <ProductDetails 
            categories={categories}
            storeUrl={resolvedParams.storeUrl}
        />
    </div>
}