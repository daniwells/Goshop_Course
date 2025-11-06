import CategoryDetails from "@/components/dashboard/forms/category-details"

export default function AdminNewCategoryPage() {
    const CLUDINARY_CLOUD_KEY=process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
    
    if(!CLUDINARY_CLOUD_KEY) return null;

    return (
        <div className="w-full">
            <CategoryDetails cloudinary_key={CLUDINARY_CLOUD_KEY} />
        </div>
    )
}
