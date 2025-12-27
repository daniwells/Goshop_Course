"use server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Lib
import { db } from "@/lib/db";

// Prisma
import { SubCategory } from "@/lib/generated/prisma/client"

// Function: upsertSubCategory
// Description: Upserts a subCategory into the database, updating if it exists or creating a ne one if not.
// Permission Level: Admin only
// Parameters:
// - subCategory: SubCategory object containing details of the subCategory to be upserted.
// Returns: Updated or newly created subCategory details.
export const upsertSubCategory = async (subCategory: SubCategory) => {
    try {
        const user = await currentUser();

        if(!user) throw new Error("Unauthenticated.");
        if(user.privateMetadata.role !== "ADMIN")
            throw new Error("Unauthorized Access: Admin Privileges Required for Entry.");

        if(!subCategory) throw new Error('Please provide subCategory data.');

        const existingSubCategory = await db.subCategory.findFirst({
            where: {
                AND:[
                    {
                        OR:[{name: subCategory.name}, {url: subCategory.url}]
                    },
                    {
                        NOT: {
                            id: subCategory.id,
                        }
                    }
                ]
            }
        });

        if(existingSubCategory){
            let errorMessage = "";

            if(existingSubCategory.name === subCategory.name){
                errorMessage = 'A subCategory with the same name already exists';
            }else if(existingSubCategory.url === subCategory.url) {
                errorMessage = "A subCategory with the same URL already exists";
            }
            throw new Error(errorMessage)
        }
        
        const subCategoryDetails = await db.subCategory.upsert({
            where: {
                id: subCategory.id,
            },
            update: subCategory,
            create: subCategory,
        });

        return subCategoryDetails;
    } catch (error) {   
        console.log(error);
        throw error;
    }
}

// Function: getAllSubCategories
// Description: Retrieves all subCategories from database
// Permission Level: Public
// Returns: Array of subCategories sorted by updateAt date in descending order.
export const getAllSubCategories = async () => {
    const subCategories = db.subCategory.findMany({
        include: {
            category: true,
        },
        orderBy: { updatedAt: "desc" }
    });

    return subCategories
}

// Function: getSubCategory
// Description: Retrieves a specific subCategory from the database.
// Permission Level: Public
// Parameters:
// - subCategoryId: The ID of the subCategory to be retrieved.
// Returns: Details of the requested subCategory.
export const getSubCategory = async (subCategoryId: string) => {
    if(!subCategoryId) throw new Error('Please provide category ID.');

    const subCategory = await db.subCategory.findUnique({
        where: {
            id: subCategoryId,
        }
    });
    return subCategory;
}

// Function: deleteSubCategory
// Description: Deletes a subCategory from database.
// Permission Level: Admin only
// Parameters:
// - subCategoryId: The ID of the subCategory to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteSubCategory = async (subCategoryId: string) => {
    const user = await currentUser();

    if(!user) return;
    
    if(user.privateMetadata.role !== "ADMIN")
        throw new Error("Unauthorized Access: Admin Privileges Required for Entry.");

    if(!subCategoryId) throw new Error('Please provide subCategory ID.');

    const response = await db.subCategory.delete({
        where: {
            id: subCategoryId
        }
    });

    return response;
}

// Function: getSubCategories
// Description: Retrieves subcategories from the database, with options for limiting results and random selection.
// Parameters:
// - limit: Number indicating the maximum number of subcategories to retrieve.
// - random: Boolean indicating whether to return random subcategories.
// Returns: List of subcategories based on the provided options.
export const getSubCategories = async (
    limit: number | null,
    random: boolean = false
): Promise<SubCategory[]> => {
    enum SortOrder {
        asc = "asc",
        desc = "desc",
    }

    try{
        const queryOptions = {
            take: limit || undefined,
            orderBy: random ? { createdAt: SortOrder.desc } : undefined,
        };

        if(random) {
            const subcategories = await db.$queryRaw<SubCategory[]>`
                SELECT * FROM SubCategory
                ORDER BY RAND()
                LIMIT ${limit || 10}
            `
            return subcategories;
        }else{
            const subcategories = await db.subCategory.findMany(queryOptions);
            return subcategories;
        }
    }catch(error){
        console.error("Error fetching subcategories:", error);
        throw error;
    }
}