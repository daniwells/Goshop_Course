"use client";

import { ProductType } from "@/lib/types";
import { getProducts } from "@/queries/product";
import { useEffect, useState } from "react";
import ProductList from "../shared/product-list";

interface Props {
    storeUrl: string;
    count: number;
    storeName: string;
}

const StoreProducts: React.FC<Props> = ({ storeUrl, count, storeName }) => {
    const [ products, setProducts ] = useState<ProductType[]>([]);
    
    useEffect(() => {
        getStoreProducts();
    }, []);

    const getStoreProducts = async () => {
        const res = await getProducts({ store: storeUrl }, "", 1, count);
        setProducts(res.products);
    }

    return <div className="relative mt-6" >
        <ProductList
            products={products}
            title={` Recommended from ${storeName} `}
            arrow
        >   

        </ProductList>
    </div>;
}
 
export default StoreProducts;