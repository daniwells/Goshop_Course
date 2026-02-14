import { ReactNode } from "react";
import StoreHeader from "@/components/store/layout/header/header";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Footer from "@/components/store/layout/footer/footer";

import { Toaster } from "react-hot-toast";

export default function StoreLayout({
    children
}: {
    children: ReactNode 
}) {
    return <div className="!light">
        {/* <StoreHeader/>
        <CategoriesHeader/> */}
        <div>{children}</div>
        {/* <Footer/> */}
        <Toaster position="top-center"/>
    </div>
}
