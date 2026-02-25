"use client";

// React, Next.js
import React, { useEffect, useMemo, useState } from "react";

// Types
import { CartProductType, ProductPageDataType } from "@/lib/types";
import { cn, isProductValidToAdd } from "@/lib/utils/utils-client";
import { ProductVariantImage } from "@/lib/generated/prisma/client";

// Components
import ProductSwiper from "./product-swiper";
import ProductInfo from "./product-info/product-info";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnSecurityPrivacyCard from "./returns-security-privacy-card";
import QuantitySelector from "./quantity-selector";
import SocialShare from "../shared/social-share";

// Toaster
import toast from "react-hot-toast";

// Cart Store
import { useCartStore } from "@/cart-store/userCartStore";
import useFromStore from "@/hooks/useFromStore";

interface Props {
    productData: ProductPageDataType;
    sizeId: string | undefined;
    children: React.ReactNode;
}

export const ProductPageContainer: React.FC<Props> = ({ productData, sizeId, children }) => {
    if(!productData) return null;
    
    const { productId, variantId, variantSlug, images, shippingDetails, sizes } = productData;
    if(typeof shippingDetails === "boolean") return null;

    const [ variantImages, setVariantImages ] = useState<ProductVariantImage[]>(images);

    const [ activeImage, setActiveImage ] = useState<ProductVariantImage | null>(
        images[0]
    );
    
    const data: CartProductType = {
        productId: productData.productId,
        variantId: productData.variantId,
        productSlug: productData.productSlug,
        variantSlug: productData.variantSlug,
        name: productData.name,
        variantName: productData.variantName,
        image: productData.images[0].url,
        variantImage: productData.variantImage,
        quantity: 1,
        price: 0,
        sizeId: sizeId || "",
        size: "",
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
            ...prevProduct,
            [property]: value,
        }));
    };

    useEffect(() => {
        const check = isProductValidToAdd(productToBeAddedToCart);
        setIsProductValid(check);
    },[productToBeAddedToCart]);

    const addToCart = useCartStore((state) => state.addToCart);
    const setCart = useCartStore((state) => state.setCart);

    const cartItems = useFromStore(useCartStore, (state) => state.cart);

    useEffect(() => {
        const handleStoreChange = (event: StorageEvent) => {
            if(event.key === "cart"){
                try{
                    const parsedValue = event.newValue ? JSON.parse(event.newValue) : null;
                    
                    if(
                        parsedValue && 
                        parsedValue.state && 
                        Array.isArray(parsedValue.state.cart)
                    ){
                        setCart(parsedValue.state.state.cart)
                    }
                }catch (error){
                    console.error("Failed to parse updated cart data:", error);
                }
            }
        }

        window.addEventListener("storage", handleStoreChange);
        return () => {
            window.removeEventListener("storage", handleStoreChange);
        }
    }, [])

    const handleAddToCart = () => {
        if(maxQty <= 0) return;

        addToCart(productToBeAddedToCart);
        toast.success("Product added to cart successfully.");
    }

    const { stock } = productToBeAddedToCart;

    const maxQty = useMemo(() => {
        const search_product = cartItems?.find((p) => 
            p.productId === productId &&
            p.variantId === variantId &&
            p.sizeId === sizeId
        );

        return search_product ? search_product.stock - search_product.quantity : stock;
    }, [cartItems, productId, variantId, sizeId, stock]);

    return <div className="relative">
        <div className="w-full xl:flex xl:gap-4">
            <ProductSwiper 
                images={variantImages.length > 0 ? variantImages : images}
                activeImage={activeImage || images[0]}
                setActiveImage={setActiveImage}
            />
            <div className="w-full mt-4 md:mt-0 flex flex-col justify-between gap-4 md:flex-row">
                <ProductInfo 
                    productData={productData}
                    sizeId={sizeId}
                    handleChange={handleChange}
                    setVariantImages={setVariantImages}
                    setActiveImage={setActiveImage}
                />
                <div className="w-[390px] min-w-[390px]">
                    <div className="z-20">
                        <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
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
                                <button 
                                    className="relative w-full py-2.5 min-w-20 bg-orange-background hover:bg-orange-hover text-white h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none"
                                    onClick={() => {}}
                                >
                                    <span>
                                        Buy now
                                    </span>
                                </button>
                                <button 
                                    disabled={!isProductValid}
                                    className={cn("relative w-full py-2.5 min-w-20 bg-orange-border hover:bg-[#e4cdce] text-orange-hover h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none",{
                                        "cursor-not-allowed": !isProductValid || maxQty <= 0,
                                    })}
                                    onClick={() => handleAddToCart()}
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
