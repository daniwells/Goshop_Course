// Components
import CategoryDetails from "@/components/dashboard/forms/category-details";

// Icons
import { Plus } from "lucide-react";

// Ui
import DataTable from "@/components/ui/data-table";

// Queries
import { getAllCategories } from "@/queries/category";


export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  
  if(!categories) return null;

  const CLOUDINARY_CLOUD_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
  if(!CLOUDINARY_CLOUD_KEY) return null

  return <DataTable 
    
    actionButtonText={
      <>
        <Plus size={15} />
        Create category
      </>
    } 
    modalChildren={
      <CategoryDetails/>
    }
    filterValue="name"
    data={categories}
    searchPlaceholder="Search category name..."
    columns={[]}
  />
}