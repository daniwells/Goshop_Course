"use client";

import { useCartStore } from "@/cart-store/userCartStore";
import FastDelivery from "@/components/store/cards/fast-delivery";
import CartHeader from "@/components/store/cart-page/cart-header";
import { SecurityPrivacyCard } from "@/components/store/product-page/returns-security-privacy-card";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType, Country } from "@/lib/types";
import { useState } from "react";
import CartProductCard from "@/components/store/cards/cart-product";
import CartSummary from "@/components/store/cart-page/summary";

export default function CartPage() {
    const cartItems = useFromStore(useCartStore, (state) => state.cart);

    const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
    const [totalShipping, setTotalShipping] = useState<number>(0);

    return <div>
        {
            cartItems && cartItems.length > 0 ?
                <div className="bg-[#f5f5f5] pb-96">
                    <div className="max-w-[1200px] mx-auto py-6 flex">
                        <div className="min-w-0 flex-1">
                            <CartHeader
                                cartItems={cartItems}
                                selectedItems={selectedItems}
                                setSelectedItems={setSelectedItems}
                            />
                            <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                                {
                                    cartItems.map((product) => (
                                        <CartProductCard
                                            key={product.productId}
                                            product={product}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                            setTotalShipping={setTotalShipping}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                        <div className="sticky to-4 ml-5 w-[380px] max-h-max">
                            <CartSummary
                                cartItems={cartItems}
                                shippingFees={totalShipping}
                            />
                            <div className="mt-2 p-4 bg-white px-6">
                                <FastDelivery/>
                            </div>
                            <div className="mt-2 p-4 bg-white px-6">
                                <SecurityPrivacyCard/>
                            </div>
                        </div>
                    </div>
                </div>
            :
                <div className="pb-96 pt-24 pl-24" >No product</div>
        }
        
    </div>
}
