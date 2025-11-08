import { Plus } from "lucide-react";

// Components
import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details";
import { columns } from "./columns";

// Ui
import DataTable from "@/components/ui/data-table";

// Queries
import { getAllCategories } from "@/queries/category";
import { getAllSubCategories } from "@/queries/subCategory";

export default async function AdminSubCategoriesPage() {
    const subCategories = await getAllSubCategories();

    if (!subCategories) return null;

    const categories = await getAllCategories();

    return <DataTable
        actionButtonText={
            <>
                <Plus size={15}/>
                Create SubCategory
            </>
        }
        modalChildren={<SubCategoryDetails categories={categories}/>}
        newTabLink="/dashboard/admin/subCategories/new"
        filterValue="name"
        data={subCategories}
        searchPlaceholder="Search subCategory name..."
        columns={columns}
    />
}