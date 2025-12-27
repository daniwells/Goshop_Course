
// React, Nextjs
import Image from "next/image";
import { useEffect, useRef } from "react";

// Swiper components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";

// Types
import { ProductVariantImage } from "@/lib/generated/prisma/client";

export default function ProductCardImageSwiper({images}: {images: ProductVariantImage[]}) {
    const swiperRef = useRef<any>(null);

    useEffect(() => {
        if(swiperRef.current && swiperRef.current.swiper){
            swiperRef.current.swiper.autoplay.stop();
        }
    }, [swiperRef])
    
    return <div 
        className="relative mb-2 w-full h-[200px] bg-white constrast-[90%] rounded-2xl overflow-hidden"
        onMouseEnter={() => swiperRef.current.swiper.autoplay.start()}
        onMouseLeave={() => {
            swiperRef.current.swiper.autoplay.stop();
            swiperRef.current.swiper.slideTo(0);
        }}
    >
        <Swiper
            modules={[Autoplay]}
            autoplay={{delay: 500}}
            ref={swiperRef}
        >
            {
                images.map((img) => (
                    <SwiperSlide>
                        <Image 
                            src={img.url}
                            alt=""
                            width={400}
                            height={400}
                            className="block object-cover h-[200px] w-48 sm:w-52"
                        />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    </div>
}
