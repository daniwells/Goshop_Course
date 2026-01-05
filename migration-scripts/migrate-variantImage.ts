"use server";

import { db } from "@/lib/db";

export async function updateVariantImage (){
    try {
        const variants = await db.productVariant.findMany({
            include: {
                images: true,
            }
        });

        for(const variant of variants){
            if(variant.images.length>0){
                const firstImage = variant.images[0];
                await db.productVariant.update({
                    where: {id: variant.id},
                    data: {
                        variantImage: firstImage.url,
                    }
                });
            }
        }
    }catch (error) {
        console.log("Error updating variant images:", error);
    }
}