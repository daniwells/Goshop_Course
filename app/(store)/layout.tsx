import { ReactNode } from "react";
import StoreHeader from "@/components/store/layout/header/header";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";

export default function StoreLayout({
    children
}: {
    children: ReactNode 
}) {
    return <div>
        <StoreHeader/>
        <CategoriesHeader/>
        <div>{children}</div>
        <div></div>
    </div>
}
