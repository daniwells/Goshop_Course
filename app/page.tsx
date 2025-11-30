import ThemeToggle from "@/components/shared/theme-toggle";
// import { updateVariantImage } from "@/migration-scripts/migrate-variantImage";
import { UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  // await updateVariantImage();

  return (
    <div className="p-5">
      <div className="w-full flex gap-x-5 justify-end">
        <UserButton/>
        <ThemeToggle/>
      </div>
      Home Page
    </div>
    
  );
}
