import { cn } from "@/lib/utils/utils-client";
import Link from "next/link";
import Image from "next/image";

interface Variant {
    url: string;
    img: string;
    slug: string;
}

interface Props {
    variants: Variant[];
    slug: string;
}

const ProductVariantSelector: React.FC<Props> = ({ variants, slug }) => {
    return <div className="flex items-center flex-wrap gap-2">
        {
            variants.map((variant, i) => (
                <Link href={variant.url} key={i}>
                    <div className={cn("w-12 h-12 rounded-full grid place-items-center p-0.5 overflow-hidden border border-transparend hover:border-main-primary cursor-pointer transition-all duration-75 ease-in-out", {
                        "border-main-primary": slug === variant.slug,
                    })}>
                        <Image 
                            src={variant.img}
                            alt={`product variant ${variant.url}`}
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
