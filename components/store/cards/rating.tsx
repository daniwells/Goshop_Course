"use client";

import dynamic from "next/dynamic";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ReactStars = dynamic(() => import("react-rating-stars-component"), {
  ssr: false,
});

export default function RatingCard({ rating }: { rating: number }) {
  const fixedRating = Number(rating.toFixed(2));

  return (
    <div className="h-44 flex-1">
      <div className="p-6 bg-[#f5f5f5] flex flex-col h-full justify-center overflow-hidden rounded-lg">
        <div className="text-6xl font-bold">{fixedRating}</div>

        <div className="py-1.5">
          <ReactStars
            count={5}
            value={fixedRating}
            size={24}
            isHalf={true}
            edit={false}
            color="#e2dfdf"
            activeColor="#f5b301"
            emptyIcon={<FaRegStar />}
            halfIcon={<FaStarHalfAlt />}
            filledIcon={<FaStar />}
          />
        </div>

        <div className="text-[#03c97a] leading-5 mt-2">
          All from verified purchases
        </div>
      </div>
    </div>
  );
}
