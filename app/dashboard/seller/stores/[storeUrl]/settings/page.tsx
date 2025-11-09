// Custom components
import StoreDetails from "@/components/dashboard/forms/store-details";

// Db
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SellerStoreSettingsPage({
    params
}: {
    params: {storeUrl: string};
}) {
    const resolvedParams = await params;
    const storeDetails = await db.store.findUnique({
        where: {
            url: resolvedParams.storeUrl,
        }
    });

    if(!storeDetails) redirect("/dashboard/seller/store");

    return <div><StoreDetails data={storeDetails}/></div>
    
}
