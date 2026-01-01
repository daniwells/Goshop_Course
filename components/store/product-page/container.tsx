"use clinet";

// React, Next.js
import React, { useEffect, useState } from "react";

// Types
import { CartProductType, ProductPageDataType } from "@/lib/types";
import { cn, isProductValidToAdd } from "@/lib/utils/utils-client";

// Components
import ProductSwiper from "./product-swiper";
import ProductInfo from "./product-info/product-info";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnSecurityPrivacyCard from "./returns-security-privacy-card";
import QuantitySelector from "./quantity-selector";
import SocialShare from "../shared/social-share";

interface Props {
    productData: ProductPageDataType;
    sizeId: string | undefined;
    children: React.ReactNode;
}

export const ProductPageContainer: React.FC<Props> = ({ productData, sizeId, children }) => {
    if(!productData) return null;
    
    const { images, shippingDetails, sizes } = productData;
    if(typeof shippingDetails === "boolean") return null;

    const data: CartProductType = {
        productId: productData.productId,
        variantId: productData.variantId,
        productSlug: productData.productSlug,
        variantSlug: productData.variantSlug,
        name: productData.name,
        variantName: productData.variantName,
        image: productData.images[0].url,
        variantImage: productData.variantImage,
        sizeId: sizeId || "",
        size: "string",
        quantity: 1,
        price: 0,
        stock: 1,
        weight: productData.weight || 0,
        shippingMethod: shippingDetails.shippingFeeMethod,
        shippingService: shippingDetails.shippingService,
        shippingFee: shippingDetails.shippingFee,
        extraShippingFee: shippingDetails.extraShippingFee,
        deliveryTimeMin: shippingDetails.deliveryTimeMin,
        deliveryTimeMax: shippingDetails.deliveryTimeMax,
        isFreeShipping: shippingDetails.isFreeShipping,
    }

    const [ productToBeAddedToCart, setProductToBeAddedToCart ] = useState<CartProductType>(data);    
    const [ isProductValid, setIsProductValid ] = useState<boolean>(false);

    const handleChange = (property: keyof CartProductType, value: any) => {
        setProductToBeAddedToCart((prevProduct) => ({
            ...prevProduct, [property]: value,
        }))
    }

    useEffect(() => {
        const check = isProductValidToAdd(productToBeAddedToCart);
        setIsProductValid(check)
    },[productToBeAddedToCart])

    return <div className="relative">
        <div className="w-full xl:flex xl:gap-4">
            <ProductSwiper images={images} />
            <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
                <ProductInfo 
                    productData={productData}
                    sizeId={sizeId}
                    handleChange={handleChange}
                />
                <div className="w-[390px]">
                    <div className="z-20">
                        <div className="bg-whie border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
                            {
                                typeof shippingDetails !== "boolean" && 
                                    <>
                                        <ShipTo 
                                            countryCode={shippingDetails.countryCode}
                                            countryName={shippingDetails.countryName}
                                            city={shippingDetails.city}
                                        />
                                        <div className="mt-3 space-y-3">
                                            <ShippingDetails 
                                                shippingDetails={shippingDetails}
                                                quantity={1}
                                                weight={productData.weight || 1}
                                            />
                                        </div>
                                        <ReturnSecurityPrivacyCard returnPolicy={shippingDetails.returnPolicy}/>
                                    </>
                            }
                            <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
                                {
                                    sizeId && <div className="w-full flex justify-end mt-4">
                                        <QuantitySelector
                                            productId={productToBeAddedToCart.productId}
                                            variantId={productToBeAddedToCart.variantId}
                                            sizeId={productToBeAddedToCart.sizeId}
                                            quantity={productToBeAddedToCart.quantity}
                                            stock={productToBeAddedToCart.stock}
                                            handleChange={handleChange}
                                            sizes={sizes}
                                        />
                                    </div>
                                }
                                <button className="relative w-full py-2.5 min-w-20 bg-orange-background hover:bg-orange-hover text-white h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none">
                                    <span>
                                        Buy now
                                    </span>
                                </button>
                                <button 
                                    disabled={!isProductValid}
                                    className={cn("relative w-full py-2.5 min-w-20 bg-orange-border hover:bg-[#e4cdce] text-orange-hover h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none",{
                                        "cursor-not-allowed": !isProductValid
                                    })}
                                >
                                    <span>
                                        Add to cart
                                    </span>
                                </button>
                                <SocialShare
                                    url={`/product/${productData.productSlug}/${productData.variantSlug}`}
                                    quote={`${productData.name} - ${productData.variantName} `}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="w-[calc(100%-390px)] mt-6 pb-16">
            {children}
        </div>
    </div>
}
