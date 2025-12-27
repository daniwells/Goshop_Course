import { FC } from "react";
import { ProductType } from "@/lib/types";
import Link from "next/link";
import { ChevronRight, Divide } from "lucide-react";
import { cn } from "@/lib/utils/utils-client";
import ProductCard from "../cards/product/product-card";

interface Props {
    products: ProductType[];
    title?: string;
    link?: string;
    arrow?: boolean;
}

const ProductList: FC<Props> = ({ products, title, link, arrow }) => {
    const Title = () => link ? <Link href={link} className="h-12">
            <h2 className="text-main-primary text-xl font-bold">
                {title}&nbsp;
                {arrow && <ChevronRight className="w-3 inline-block"/>}
            </h2>
        </Link> 
    : 
        <h2 className="text-main-primary text-xl font-bold">
            {title}&nbsp;
            {arrow && <ChevronRight className="w-3 inline-block"/>}
        </h2>

    return <div className="relative">
        { title && <Title/> }
        { products.length > 0 ? <div className={cn("flex flex-wrap -translate-x-5 w-[cacl(100%+3rem)] sm:w-[calc(100%+1.5rem)]", {
            "mt-2":title,
        })}>
            {
                products.map((product) => (
                    <ProductCard 
                        key={product.id}
                        product={product}
                    />
                ))
            }
        </div> : "No products."}
    </div>;
}

export default ProductList;