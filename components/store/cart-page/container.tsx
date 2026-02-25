"use client";

import { useCartStore } from "@/cart-store/userCartStore";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType, Country } from "@/lib/types"
import { useEffect, useState } from "react";
import CartHeader from "./cart-header";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import CartProductCard from "@/components/store/cards/cart-product";
import EmptyCart from "./empty-cart";
import { updateCartWithLatest } from "@/queries/user";
import CountryNote from "./country-note";

export default function CartContainer({
    userCountry
}: {
    userCountry: Country;
}) {
    const cartItems = useFromStore(useCartStore, (state) => state.cart);
    const setCart = useCartStore((state) => state.setCart);

    const [ loading, setLoading ] = useState<boolean>(true);
    const [ isCartLoaded, setIsCartLoaded ] = useState<boolean>(false);

    const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
    const [totalShipping, setTotalShipping] = useState<number>(0);
    
    useEffect(() => {
        if(cartItems !== undefined) {
            setIsCartLoaded(true);
        }
    }, [cartItems]);


    useEffect(() => {
        const loadAndSyncCart = async () => {
            if(cartItems?.length){
                try {
                    const updatedCart = await updateCartWithLatest(cartItems);
                    setCart(updatedCart);
                    setLoading(false);
                } catch (error) {
                    console.error("Failed to sync cart:", error);
                }

            }
        }

        loadAndSyncCart();
    }, [isCartLoaded, userCountry]);

    return <div>
        {
            cartItems && cartItems.length > 0 ?
                <>
                    {
                        loading ?
                            <div>loading...</div>
                        : 
                            <div className="bg-[#f5f5f5] min-h-[calc(100vh-65px)]">
                                <div className="max-w-[1200px] mx-auto py-6 flex">
                                    <div className="min-w-0 flex-1">
                                        <CartHeader
                                            cartItems={cartItems}
                                            selectedItems={selectedItems}
                                            setSelectedItems={setSelectedItems}
                                        />
                                        <div className="my-2">
                                            <CountryNote country={userCountry.name} />
                                        </div>
                                        <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                                            {
                                                cartItems.map((product) => (
                                                    <CartProductCard
                                                        key={product.productId}
                                                        product={product}
                                                        selectedItems={selectedItems}
                                                        setSelectedItems={setSelectedItems}
                                                        setTotalShipping={setTotalShipping}
                                                        userCountry={userCountry}
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
                    }
                </>
                
            :
                <EmptyCart/>
        }
    </div>
}
