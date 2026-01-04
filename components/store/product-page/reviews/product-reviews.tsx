"use client";

import { RatingStatisticsType, ReviewsFiltersType, ReviewsOrderType, ReviewWithImageType, VariantInfoType } from "@/lib/types";
import RatingCard from "../../cards/rating";
import RatingStatisticsCard from "../../cards/rating-statiscs";
import { useEffect, useState } from "react";
import ReviewCard from "../../cards/review";
import { getProductFilteredReviews } from "@/queries/product";
import ReviewsFilters from "./filters";
import ReviewsSort from "./sort";
import Pagination from "../../shared/pagination";
import ReviewDetails from "../../forms/review-details";

interface Props {
    productId: string;
    rating: number;
    statistics: RatingStatisticsType;
    reviews: ReviewWithImageType[];
    variantsInfo: VariantInfoType[];
}

const ProductReviews: React.FC<Props> = ({
    productId,
    rating,
    statistics,
    reviews,
    variantsInfo,
}) => {
    const [ data, setData ] = useState<ReviewWithImageType[]>(reviews);
    const { totalReviews, ratingStatistics } = statistics;

    const half = Math.ceil(data.length / 2);

    const filtered_data = {
        rating: undefined,
        hasImages: undefined,
    };

    const [filters, setFilters] = useState<ReviewsFiltersType>(filtered_data);
    const [sort, setSort] = useState<ReviewsOrderType>();

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(4);

    useEffect(() => {
        if(filters.rating || filters.hasImages || sort){
            setPage(1);
            handleGetReviews();
        }
        if(page){
            handleGetReviews();
        }
    }, [filters, sort, page]);

    const handleGetReviews = async () => {
        const res = await getProductFilteredReviews(
            productId,
            filters,
            sort,
            page,
            pageSize
        );
        setData(res);
    }

    return <div id="reviews" className="pt-6">
        <div className="h-12">
            <h2 className="text-main-primary text-2xl font-bold" >
                Custom Reviews ({totalReviews})
            </h2>
        </div>
        <div className="w-full">
            <div className="flex items-center gap-4">
                <RatingCard rating={rating}/>
                <RatingStatisticsCard
                    statistics={ratingStatistics}
                />
            </div>
        </div>
        {
            totalReviews > 0 && <>
                <div className="space-y-6">
                    <ReviewsFilters
                        filters={filters}
                        setFilters={setFilters}
                        setSort={setSort}
                        stats={statistics}
                    />
                    <ReviewsSort
                        sort={sort}
                        setSort={setSort}
                    />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {
                        data.length > 0 ?
                            <>
                                <div className="flex flex-col gap-3">
                                    {
                                        data.slice(0, half).map((review) => (
                                                <ReviewCard key={review.id} review={review} />
                                            ))
                                    }
                                </div>
                                <div className="flex flex-col gap-3">
                                    {
                                        data.slice(half).map((review) => (
                                                <ReviewCard key={review.id} review={review} />
                                            ))
                                    }
                                </div>
                            </>
                        :
                            <>No Reviews.</>

                    }
                </div>
                {
                    data.length > pageSize &&
                        <Pagination
                            page={page}
                            totalPages={
                                filters.rating || filters.hasImages
                                    ? data.length / pageSize 
                                    : totalReviews / pageSize
                            }
                            setPage={setPage}
                        />
                }
            </>
        }
        <div className="mt-10">
            <ReviewDetails
                productId={productId}
                variantsInfo={variantsInfo}
                setReviews={setData}
                reviews={data}
            />
        </div>
    </div>;
}
 
export default ProductReviews;