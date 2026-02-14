import StoreCard from "@/components/store/cards/store-card";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Header from "@/components/store/layout/header/header";
import { ProductPageContainer } from "@/components/store/product-page/container";
import ProductDescription from "@/components/store/product-page/product-description";
import ProductQuestions from "@/components/store/product-page/product-questions";
import ProductSpecs from "@/components/store/product-page/product-specs";
import RelatedProducts from "@/components/store/product-page/related-product";
import ProductReviews from "@/components/store/product-page/reviews/product-reviews";
import StoreProducts from "@/components/store/product-page/store-products";
import { Separator } from "@/components/ui/separator";
import { getProductPageData, getProducts } from "@/queries/product";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: {productSlug: string, variantSlug: string};
    searchParams: {
        size?: string
    }
}

export default async function ProductVariantPage({
    params,
    searchParams,
}: PageProps,) {
    const resolvedSearchParams = await searchParams;

    const sizeId = resolvedSearchParams?.size;

    const resolvedParams = await params;
    const productData = await getProductPageData(resolvedParams.productSlug, resolvedParams.variantSlug);

    if(!productData)
        return notFound();

    const { sizes } = productData;

    if(sizeId){
        const isValidSize = sizes.some((size) => size.id === sizeId);

        if(!isValidSize)
            return redirect(`/product/${resolvedParams.productSlug}/${resolvedParams.variantSlug}`);

    }else if(!sizeId && sizes.length === 1){
        return redirect(`/product/${resolvedParams.productSlug}/${resolvedParams.variantSlug}?sizeId=${sizes[0].id}`)
    }

    const { 
        specs,
        questions,
        subCategory,
        store,
        reviewsStatistics,
        reviews,
        variantsInfo
    } = productData;
    
    const relatedProducts = await getProducts({
        subCategory: subCategory.url
    }, "", 1, 12);

    return <div>
        <Header/>
        <CategoriesHeader/>
        <div className="max-w-[1960px] mx-auto p-4 overflow-x-hidden" >
            <ProductPageContainer productData={productData} sizeId={sizeId} >
                <div>
                    {
                        relatedProducts.products && 
                        <>
                            <Separator/>
                            <RelatedProducts
                                products={relatedProducts.products}
                            />
                        </>
                    }
                    <Separator className="mt-6" />
                    <ProductReviews
                        productId = {productData.productId}
                        rating={productData.rating}
                        statistics={reviewsStatistics}
                        reviews={reviews}
                        variantsInfo={variantsInfo}
                    />
                    <>
                        <Separator className="mt-6" />
                        <ProductDescription
                            text={[productData.description, productData.variantDescription || ""]}
                        />
                    </>
                    {
                        (specs.product.length > 0 || specs.variant.length) &&
                        <>
                            <Separator className="mt-6" />
                            <ProductSpecs specs={specs}/>
                        </>
                    }
                </div>
                {
                    questions.length > 0 && <>
                        <Separator className="mt-6"/>
                        <ProductQuestions questions={productData.questions}/>
                    </>
                }
                <Separator className="mt-6"/>
                <StoreCard store={productData.store} />
                <StoreProducts
                    storeUrl={store.url}
                    storeName={store.name}
                    count={5}
                />
            </ProductPageContainer>
        </div>
    </div>
}
