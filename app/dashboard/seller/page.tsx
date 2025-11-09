// Next
import { redirect } from "next/navigation";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Lib
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const user = await currentUser();

  if(!user) redirect("/");

  const stores = await db.store.findMany({
    where: {
      userId: user.id,
    }
  });

  if(stores.length===0) redirect("dashboard/seller/stores/new");

  redirect(`/dashboard/seller/stores/${stores[0].url}`);

  return <div>Seller Dashboard</div>
}