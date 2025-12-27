"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import type { ProductVariantImage } from "@/lib/generated/prisma/client";

export default function ProductCardImageSwiper({
  images,
}: {
  images: ProductVariantImage[];
}) {
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    swiperRef.current?.swiper?.autoplay?.stop?.();
  }, []);

  return (
    <div
      className="relative mb-2 w-full h-[200px] bg-white rounded-2xl overflow-hidden"
      onMouseEnter={() => swiperRef.current?.swiper?.autoplay?.start?.()}
      onMouseLeave={() => {
        swiperRef.current?.swiper?.autoplay?.stop?.();
        swiperRef.current?.swiper?.slideTo?.(0);
      }}
    >
      <Swiper
        ref={swiperRef}
        modules={[Autoplay]}
        autoplay={{ delay: 500, disableOnInteraction: false }}
        slidesPerView={1}
        spaceBetween={0}
        loop={images.length > 1}
        allowTouchMove={false}
        className="h-full w-full"
      >
        {images.map((img) => (
          <SwiperSlide
            key={img.id}
            className="!h-full !w-full flex-shrink-0"
          >
            <div className="relative h-full w-full">
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
