import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const user = await currentUser();
    
    if(!user?.privateMetadata?.role || user?.privateMetadata.role === "USER") redirect("/")
    if(user?.privateMetadata.role === "ADMIN") redirect("/dashboard/admin")
    if(user?.privateMetadata.role === "SELLER") redirect("/dashboard/seller")

    return <div>Dashboard Page</div>
}

