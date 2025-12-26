"use client";

import { Category, OfferTag } from "@/lib/generated/prisma/client";
import { useState } from "react";
import CategoriesMenu from "./categories-menu";
import OfferTagsLinks from "./offer-tags-links";

export default function CategoriesHeaderContainer({
    categories, offerTags
}: {
    categories: Category[], offerTags: OfferTag[]
}) {
    const [ open, setOpen ] = useState<boolean>(false);

    return <div className="w-full px-4 flex items-center gap-x-1">
        <CategoriesMenu
            categories={categories}
            open={open}
            setOpen={setOpen}
        />
        <OfferTagsLinks offerTags={offerTags} open={open} />
    </div>
}
