import { getStoreDefaultShippingDetails, getStoreShippingRates } from "@/queries/store"
import StoreDefaultShippingDetails from "@/components/dashboard/forms/store-default-shipping-details";
import { redirect } from "next/navigation";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function SellerStoreShippingPage({
    params 
}: { 
    params: { storeUrl: string } 
}) {
    const resolvedParams = await params;

    const shippingDetails = await getStoreDefaultShippingDetails(resolvedParams.storeUrl);
    if(!shippingDetails) return redirect("/");
    
    const shippingRates = await getStoreShippingRates(resolvedParams.storeUrl);

    return (
        <div>
            <StoreDefaultShippingDetails 
                data={shippingDetails}
                storeUrl={resolvedParams.storeUrl}
            />
            <DataTable
                filterValue="CountryName"
                data={shippingRates}
                columns={columns}
                searchPlaceholder="Search by country name..."
            />
        </div>
    )
}
