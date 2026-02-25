"use client";

import { ProductType, VariantSimplified } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

const ReactStars = dynamic(() => import("react-rating-stars-component"), {
  ssr: false,
});

import ProductCardImageSwiper from "./swiper";
import VariantSwitcher from "./variant-switcher";
import { Button } from "../../ui/button";
import { Heart } from "lucide-react";
import ProductPrice from "../../product-page/product-info/product-price";
import { addToWishlist } from "@/queries/user";

export default function ProductCard({ product }: { product: ProductType }) {
    const { name, slug, rating, sales, variantImages, variants, id } = product;
    const [variant, setVariant] = useState<VariantSimplified>(variants[0]);
    const { variantSlug, variantName, images, sizes } = variant;

    const handleaddToWishlist = async () => {
        try {
            const res = await addToWishlist(id, variant.variantId);
            if (res) toast.success("Product successfully added to wishlist.");
        } catch (error: any) {
            toast.error(error.toString());
        }
    };

    return <div>
        <div className="group w-48 sm:w-[225px] relative transition-all duration-75 bg-white ease-in-out p-4 rounded-t-3xl border border-transparent hover:shadow-xl hover:border-border">
            <div className="relative w-full h-full">
                <Link 
                    href={`/product/${slug}/${variantSlug}`} 
                    className="w-full relative inline-block overflow-hidden"
                >    
                    <ProductCardImageSwiper images={images}/>
                    <div className="text-sm text-main-primary h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
                        {name} . {variantName}
                    </div>
                    {
                        product.rating > 0 && product.sales > 0 && (
                            <div className="flex items-center gap-x-1 h-5">
                                <ReactStars
                                    count={5}
                                    size={24}
                                    color="#F5F5F5"
                                    activeColor="#FFD804"
                                    value={rating}
                                    isHalf
                                    edit={false}
                                    emptyIcon={<FaRegStar />}
                                    halfIcon={<FaStarHalfAlt />}
                                    filledIcon={<FaStar />}
                                />
                                <div className="text-xs text-main-secondary">{sales} sold</div>
                            </div>
                        )
                    }
                    <ProductPrice sizes={sizes} isCard handleChange={() => {}}/>
                </Link>
            </div>
            <div className="hidden group-hover:block absolute -left-px bg-white border border-t-0 w-[calc(100%+2px)] px-4 pb-4 rounded-b-3xl shadow-xl z-30 space-y-2">
                <VariantSwitcher 
                    images={variantImages}
                    setVariant={setVariant}
                    variants={variants}
                    selectedVariant={variant}
                />
                <div className="flex flex-items gap-x-1">
                    <Button>
                        Add to cart
                    </Button>
                    <Button 
                        variant="black"
                        size="icon"
                        onClick={() => handleaddToWishlist()}
                    >
                        <Heart className="w-5"/>
                    </Button>
                </div>
            </div>
        </div>
    </div>
}
