import { cn } from "@/lib/utils/utils-client";
import Link from "next/link";
import Image from "next/image";
import { VariantInfoType } from "@/lib/types";
import { ProductVariantImage } from "@/lib/generated/prisma/client";
import { Dispatch, SetStateAction } from "react";

interface Props {
    variants: VariantInfoType[];
    slug: string;
    setVariantImages: Dispatch<SetStateAction<ProductVariantImage[]>>;
    setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}

const ProductVariantSelector: React.FC<Props> = ({ variants, slug, setVariantImages, setActiveImage }) => {
    return <div className="flex items-center flex-wrap gap-2">
        {
            variants.map((variant, i) => (
                <Link 
                    href={variant.variantUrl}
                    key={i}
                    onMouseEnter={() => {
                        setVariantImages(variant.images);
                        setActiveImage(variant.images[0]);
                    }}
                    onMouseLeave={() => {
                        setVariantImages([]);
                        setActiveImage(null);
                    }} 
                >
                    <div className={cn("w-12 h-12 rounded-full grid place-items-center p-0.5 overflow-hidden border border-transparend hover:border-main-primary cursor-pointer transition-all duration-75 ease-in-out", {
                        "border-main-primary": slug === variant.variantSlug,
                    })}>
                        <Image 
                            src={variant.variantImage}
                            alt={`product variant ${variant.variantUrl}`}
                            width={48}
                            className="rounded-full"
                        />
                    </div>
                </Link>
            ))
        }
    </div>;
}
 
export default ProductVariantSelector;
