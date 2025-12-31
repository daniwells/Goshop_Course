import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProductPage({
    params
}: {
    params: {productSlug: string};
}) {
    const resolvedParams = await params;

    const product = await db.product.findUnique({
        where: {
            slug: resolvedParams.productSlug,
        },
        include: { variants: true },
    });

    if(!product)
        return redirect("/");

    if(!product.variants.length)
        return redirect("/");

    return redirect(`/product/${product.slug}/${product.variants[0].slug}}`);
}
