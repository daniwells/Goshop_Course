"use client";

// React, Next.js
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react"
import Image from "next/image";

// Types
import { CartProductType, ProductPageDataType } from "@/lib/types";
import { ProductVariantImage } from "@/lib/generated/prisma/client";

// Icons
import { CopyIcon } from "../../icons";

// Toast
import toast from "react-hot-toast";

import dynamic from "next/dynamic";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ReactStars = dynamic(() => import("react-rating-stars-component"), {
  ssr: false,
});

// Components
import ProductPrice from "./product-price";
import Countdown from "../../shared/countdown";
import { Separator } from "@/components/ui/separator";
import ColorWheel from "@/components/shared/color-wheel";
import ProductVariantSelector from "./variant-selector";
import SizeSelector from "./size-selector";
import ProductAssurancePolicy from "./assurance-policy";

interface Props {
    productData: ProductPageDataType;
    quantity?: number;
    sizeId: string | undefined;
    handleChange: (property: keyof CartProductType, value: any) => void;
    setVariantImages: Dispatch<SetStateAction<ProductVariantImage[]>>;
    setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>
}

const ProductInfo: FC<Props> = ({
    productData,
    quantity,
    sizeId,
    handleChange,
    setVariantImages,
    setActiveImage
}) => {
    if(!productData) return null;

    const { 
        productId,
        name,
        sku,
        colors,
        variantsInfo,
        sizes,
        isSale,
        saleEndDate,
        variantName,
        store,
        rating,
        reviewsStatistics 
    } = productData;

    const { totalReviews } = reviewsStatistics;

    const copySkuToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(sku);
            
            toast.success("Copied successfully");
        } catch (error) {
            toast.error("Failed to copy");
        }
    }

    return <div className="relative w-full">
        <div>
            <h1 className="text-main-primary inline font-bold leading-5">
                {name} - {variantName}
            </h1>
        </div>
        <div className="flex items-center text-xs mt-2">
            <Link 
                href={`/store/${store.url}`}
                className="hidden sm:inline-block md:hidden lg:inline-block mr-2 hover:underline"
            >
                <div className="w-full flex items-center gap-x-1">
                    <Image
                        src={store.logo}
                        alt={store.name}
                        width={100}
                        height={100}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </div>
            </Link>
            <div className="whitespace-nowrap">
                <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
                    SKU: {sku}
                </span>
                <span className="inline-block align-middle text-[#2F68A8] mx-1 cursor-pointer" onClick={copySkuToClipboard} >
                    <CopyIcon/>
                </span>
            </div>
            <div className="ml-4 flex items-center gap-x-2 flex-1 whitespace-nowrap">
                <ReactStars
                    count={5}
                    size={20}
                    color="#F5F5F5"
                    activeColor="#FFD804"
                    value={rating}
                    isHalf
                    edit={false}
                    emptyIcon={<FaRegStar />}
                    halfIcon={<FaStarHalfAlt />}
                    filledIcon={<FaStar />}
                />
                <Link 
                    href="#reviews"
                    className="text-[#ffd804] hover:underline"
                >
                    {
                        totalReviews === 0 ? 
                            "No review yet" 
                        : 
                            totalReviews === 1 ?
                                "1 review" 
                            : 
                                `${totalReviews} reviews`
                    }
                </Link>
            </div>
        </div>
        <div className="my-2 relative flex flex-col sm:flex-row justify-between">
            <ProductPrice sizeId={sizeId} sizes={sizes} handleChange={handleChange} />
            {
                isSale && saleEndDate && (
                    <div className="mt-4 pb-2">
                        <Countdown targetDate={saleEndDate}/>
                    </div>
                )
            }
        </div>
        <Separator className="mt-2"/>
        <div className="mt-4 space-y-2">
            <div className="relative flex items-center justify-between text-main primary font-bold">
                <span className="flex items-center gap-x-2">
                    { colors.length > 1 ? "Colors" : "Color" }
                    <ColorWheel colors={colors} size={25}/>
                </span>
            </div>
            <div className="mt-4" >
                {
                    variantsInfo.length > 0 &&
                        <ProductVariantSelector 
                            variants={variantsInfo}
                            slug={productData.variantSlug}
                            setVariantImages={setVariantImages}
                            setActiveImage={setActiveImage}
                        />
                }
            </div>
        </div>
        <div className="space-y-2 pb-2 mt-4">
            <div>
                <h1 className="text-main-primary font-bold">
                    Size
                </h1>
            </div>
            <SizeSelector 
                sizes={sizes}
                sizeId={sizeId}
                handleChange={handleChange}
            />
        </div>
        <div>
            <Separator className="mt-2"/>
            <ProductAssurancePolicy/>
        </div>  
    </div>
}

export default ProductInfo;
