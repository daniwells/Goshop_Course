"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * @name followStore
 * @description - Toggle follow status for a store by the current user.
 *              - If the user is not following the store, it follows the store.
 *              - If the user is already following the store, it unfollows the store.
 * @access User
 * @param storeId - The ID of the store to be followed/unfollowed.
 * @returns {boolean} - Returns true if the user is now following the store, false if unfollowed.
 */

export const followStore = async (storeId: string): Promise<boolean> => {
    try {
        const user = await currentUser();

        if(!user) throw new Error("Unauthenticated");

        const store = await db.store.findUnique({
            where: {
                id: storeId,
            }
        });

        if(!store) throw new Error("Store nof found.");

        const userData = await db.user.findUnique({
            where: {
                id: user.id
            },
        });

        if(!userData) throw new Error("User not found.");

        const userFollowingStore = await db.user.findFirst({
            where: {
                id: user.id,
                following: {
                    some: {
                        id: storeId,
                    }
                }
            },
        });

        if(userFollowingStore){
            await db.store.update({
                where: {
                    id: storeId,
                },
                data: {
                    followers: {
                        disconnect: { id: userData.id }
                    }
                }
            });

            return false;
        }
        
        await db.store.update({
            where: {
                id: storeId,
            },
            data: {
                followers: {
                    connect: {
                        id: userData.id,
                    }
                }
            }
        });
        return true;
        

    } catch (error) {
        console.error("Error in toggling store follow status:", error)
        throw error;
    }
}