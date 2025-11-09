"use server";

// Db
import { db } from "@/lib/db";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Prisma models
import { Store } from "@/lib/generated/prisma/client";


// Function: upsertStore
// Description: Upserts store details into the database, updating if it exists or creating a ne one if not.
// Permission Level: Seller only
// Parameters:
// - category: Partial store object containing details fo the store to be userted.
// Returns: Updated or newly created store details.
export const upsertStore = async (store: Partial<Store>) => {
    try{
        const user = await currentUser();
        if(!user) throw Error("Unauthenticated.");

        if(user.privateMetadata.role !== "SELLER")
            throw new Error(
                "Unauthorized Access: Seller Privileges Required for Entry."
            );
        
        if(!store) throw new Error("Please provide store data.");

        const existingStore = await db.store.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { name: store.name },
                            { url: store.url },
                            { email: store.email },
                            { phone: store.phone }
                        ]
                    },
                    {
                        NOT: {
                            id: store.id
                        }
                    }
                ]
            }
        });

        if(existingStore){
            let errorMessage = "";

            if(existingStore.name === store.name) {
                errorMessage = "A store with the same name already exists";
            } else if (existingStore.email === store.email) {
                errorMessage = "A store with the same email already exists";
            } else if (existingStore.phone === store.phone) {
                errorMessage = "A store with the same phone number already exists";
            } else if (existingStore.url === store.url) {
                errorMessage = "A store with the same URL already exists";
            }

            throw new Error(errorMessage);
        }

        const storeDetails = await db.store.upsert({
            where: {
                id: store.id,
            },
            update: store,
            create: {
                ...store,
                user: {
                    connect: { id: user.id }
                }
            }
        });

        return storeDetails;
    }catch(error){
        throw error;
    }
}