// Libs
import { FC } from "react"

// Prisma model
import { Category } from "@/lib/generated/prisma/client"

import * as z from "zod";

interface CategoryDetailsProps {
    data?: Category
}

const CategoryDetails: FC<CategoryDetailsProps> = () => {
    // const form
    return <div></div>;
}

export default CategoryDetails;