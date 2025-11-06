"use server";
// Function: upsertCategory
// Description: Upserts a category into the database, updating if it exists or creating a ne one if not.
// Permission Level: Admin only
// Parameters:
// - category: Category object containing details of the category to be upserted.
// Returns: Updated or newly created category details.

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Lib
import { db } from "@/lib/db";

// Prisma
import { Category } from "@/lib/generated/prisma/client"

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
}
