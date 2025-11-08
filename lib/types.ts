import { getAllSubCategories } from "@/queries/subCategory";


export interface DashboardSidebarMenuInterface {
    label: string;
    icon: string;
    link: string;    
}

// SubCategory + parent category
export type SubCategoryWithCategoryType = Awaited<
  ReturnType<typeof getAllSubCategories>
>[0];