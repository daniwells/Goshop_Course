import ThemeToggle from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";
// import { seedCountries } from "@/migration-scripts/seed-countries";

export default async function HomePage() {
  // await seedCountries();

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
