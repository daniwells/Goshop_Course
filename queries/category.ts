"use server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Lib
import { db } from "@/lib/db";

// Prisma
import { Category } from "@/lib/generated/prisma/client"

// Function: upsertCategory
// Description: Upserts a category into the database, updating if it exists or creating a ne one if not.
// Permission Level: Admin only
// Parameters:
// - category: Category object containing details of the category to be upserted.
// Returns: Updated or newly created category details.
export const upsertCategory = async (category: Category) => {
    try {
        const user = await currentUser();

        if(!user) throw new Error("Unauthenticated.");
        if(user.privateMetadata.role !== "ADMIN")
            throw new Error("Unauthorized Access: Admin Privileges Required for Entry.");

        if(!category) throw new Error('Please provide category data.');

        const existingCategory = await db.category.findFirst({
            where: {
                AND:[
                    {
                        OR:[{name: category.name}, {url: category.url}]
                    },
                    {
                        NOT: {
                            id: category.id,
                        }
                    }
                ]
            }
        });

        if(existingCategory){
            let errorMessage = "";

            if(existingCategory.name === category.name){
                errorMessage = 'A category with the same name already exists';
            }else if(existingCategory.url === category.url) {
                errorMessage = "A category with the same URL already exists";
            }
            throw new Error(errorMessage)
        }
        
        const categoryDetails = await db.category.upsert({
            where: {
                id: category.id,
            },
            update: category,
            create: category,
        });

        return categoryDetails;
    } catch (error) {   
        console.log(error);
        throw error;
    }
};

// Function: getAllCategories
// Description: Retrieves all categories from database
// Permission Level: Public
// Returns: Array of categories sorted by updateAt date in descending order.
export const getAllCategories = async () => {
    const categories = db.category.findMany({
        orderBy: { updatedAt: "desc" }
    });

    return categories;
};

// Function: getAllSubCategoriesForCategory
// Description: Retrieves all subCategories from database
// Permission Level: Public
// Returns: Array of subCategories of category sorted by updateAt date in descending order.
export const getAllSubCategoriesForCategory = async (categoryId: string) => {
    const subCategories = db.subCategory.findMany({
        where: {
            categoryId: categoryId,
        },
        orderBy: { updatedAt: "desc" }
    });

    return subCategories;
};

// Function: getCategory
// Description: Retrieves a specific category from the database.
// Permission Level: Public
// Parameters:
// - categoryId: The ID of the category to be retrieved.
// Returns: Details of the requested category.
export const getCategory = async (categoryId: string) => {
    if(!categoryId) throw new Error('Please provide category ID.');

    const category = await db.category.findUnique({
        where: {
            id: categoryId,
        }
    });
    return category;
};

// Function: deleteCategory
// Description: Deletes a category from database.
// Permission Level: Admin only
// Parameters:
// - categoryId: The ID of the category to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteCategory = async (categoryId: string) => {
    const user = await currentUser();

    if(!user) return;
    
    if(user.privateMetadata.role !== "ADMIN")
        throw new Error("Unauthorized Access: Admin Privileges Required for Entry.");

    if(!categoryId) throw new Error('Please provide category ID.');

    const response = await db.category.delete({
        where: {
            id: categoryId
        }
    });

    return response;
};
