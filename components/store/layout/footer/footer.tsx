import { getSubCategories } from "@/queries/subCategory";
import Contact from "./contact";
import Links from "./links";
import Newsletter from "./newsletter";

export default async function Footer() {
  const subs = await getSubCategories(7, true);
  return (
    <div className="w-full bg-white">
      <Newsletter />
      <div className="px-10 max-w-[1960px] mx-auto">
        <div className="p-5">
          <div className="grid md:grid-cols-2 md:gap-x-5">
            <Contact/>
            <Links subs={subs}/>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-slate-500 to-slate-800 px-2 text-white">
        <div className="px-10 max-w-[1960px] mx-auto flex items-center h-7">
          <span className="text-sm">
            <b>© GoShop</b> - All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  );
}