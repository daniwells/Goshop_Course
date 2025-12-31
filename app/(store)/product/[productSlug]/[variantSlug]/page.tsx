import { ProductPageContainer } from "@/components/store/product-page/container";
import { Separator } from "@/components/ui/separator";
import { getProductPageData } from "@/queries/product";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: {productSlug: string, variantSlug: string};
    searchParams: {
        sizeId?: string
    }
}

export default async function ProductVariantPage({
    params,
    searchParams,
}: PageProps,) {
    const resolvedSearchParams = await searchParams;
    const sizeId = resolvedSearchParams?.sizeId;

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
    
    const relatedProducts = {
        products: [],
    };

    const { specs, questions } = productData;

    return <div>
        <div className="max-w-[1960px] mx-auto p-4 overflow-x-hidden" >
            <ProductPageContainer productData={productData} sizeId={sizeId} >
                <div>
                    {
                        relatedProducts.products && <>
                            <Separator/>
                        </>
                    }
                    <Separator className="mt-6" />
                    <>
                        <Separator className="mt-6" />
                    </>
                    {
                        (specs.product.length > 0 || specs.variant.length) &&
                        <>
                            <Separator className="mt-6" />
                        </>
                    }
                </div>
                {
                    questions.length > 0 && <>
                        <Separator className="mt-6"/>
                    </>
                }
                <Separator className="mt-6"/>

            </ProductPageContainer>
        </div>
    </div>
}
