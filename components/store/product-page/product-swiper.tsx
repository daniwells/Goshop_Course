"use client";

// React, Next.js
import { useState } from "react";
import Image from "next/image";

// Utils
import { cn } from "@/lib/utils/utils-client";

// Types
import { ProductVariantImage } from "@/lib/generated/prisma/client";

// React image zoom
import ImageZoom from "react-image-zooom";

export default function ProductSwiper({
    images 
}: {
    images: ProductVariantImage[]
}) {
    if(!images) return;

    const [ activeImage, setActiveImage ] = useState<ProductVariantImage>(
        images[0]
    );

    return <div className="relative">
        <div className="relative w-full flex flex-col-reverse xl:flex-row gap-2">
            <div className="flex flex-wrap xl:flex-col gap-3">
                {
                    images.map((img) => (
                        <div 
                            key={img.url}
                            className={cn("w-16 h-16 rounded-md grid place-items-center overflow-hidden border border-gray-100 cursor-pointer transition-all duration-75 ease-in", {
                                "border-main-primary":activeImage.id === img.id,
                            })}
                            onMouseEnter={() => setActiveImage(img)}
                        >
                            <Image
                                src={img.url}
                                alt={img.alt}
                                width={80}
                                height={80}
                                className="object-cover rounded-md"
                            />
                        </div>
                    ))
                }
            </div>
            <div className="relative rounded-lg overflow-hidden w-full 2xl:h-[600px] 2xl:w-[600px]">
                <ImageZoom
                    src={activeImage.url}
                    zoom={300}
                    className="!w-full rounded-lg"
                />
            </div>
        </div>
    </div>
}
