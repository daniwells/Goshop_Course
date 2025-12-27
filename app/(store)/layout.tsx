import { ReactNode } from "react";
import StoreHeader from "@/components/store/layout/header/header";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Footer from "@/components/store/layout/footer/footer";

export default function StoreLayout({
    children
}: {
    children: ReactNode 
}) {
    return <div className="!light">
        <StoreHeader/>
        <CategoriesHeader/>
        <div>{children}</div>
        <div className="h-96"></div>
        <Footer/>
    </div>
}
