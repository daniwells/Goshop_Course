"use server";

// Db
import { db } from "@/lib/db";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Prisma models
import { Store, ShippingRate } from "@/lib/generated/prisma/client";
import { StoreDefaultShippingDetailsType } from "@/lib/types";


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

        const { userId, ...storeData } = store;

        const storeDetails = await db.store.upsert({
            where: {
                id: store.id,
            },
            update: storeData,
            create: {
                ...storeData!,
                name: store.name!,
                url: store.url!,
                email: store.email!,
                phone: store.phone!,
                description: store.description!,
                logo: store.logo!,
                cover: store.cover!,
                status: store.status!,
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

// Function: getStoreDefaultShippingDetails
// Description: Fetches the default shipping details for a store based on the store URL.
// Parameters:
// - storeUrl: The URL of the store to fetch default shipping details for.
// Returns: An object containing default shipping details, including shipping service, fees, delivery times, and return policy.
export const getStoreDefaultShippingDetails = async (storeUrl: string) => {
    try {
        if(!storeUrl) throw new Error("Store URL is required.");

        const store = await db.store.findUnique({
            where: {
                url: storeUrl,
            },
            select: {
                defaultShippingService: true,
                defaultShippingFeePerItem: true,
                defaultShippingFeeForAdditionalItem: true,
                defaultShippingFeePerKg: true,
                defaultShippingFeeFixed: true,
                defaultDeliveryTimeMin: true,
                defaultDeliveryTimeMax: true,
                returnPolicy: true,
            }
        });

        if(!store) throw new Error("Store not found.");

        return store;
    } catch (error) {
        throw error;
    }
}

// Function: updateStoreDefaultShippingDetails
// Description: Updates the default shipping details for a store based on the store URL.
// Parameters:
// - storeUrl: The URL of the store to update.
// - details: An object containing the new shipping details (shipping service, fees, delivery times, and return policy).
// Returns: An object containing default shipping details, including shipping service, fees, delivery times, and return policy.
export const updateStoreDefaultShippingDetails = async ( storeUrl: string, details: StoreDefaultShippingDetailsType ) => {
    try {
        const user = await currentUser();
        
        if(!user) throw Error("Unauthenticated.");

        if(user.privateMetadata.role !== "SELLER")
            throw new Error(
                "Unauthorized Access: Seller Privileges Required for Entry."
            );

        if(!storeUrl) throw new Error("Store URL is required.");

        if(!details)
            throw new Error("No shipping details provided to update.");

        const check_ownership = await db.store.findUnique({
            where: {
                url: storeUrl,
                userId: user?.id,
            }
        });

        if(!check_ownership)
            throw new Error("Make sure you have the permissions to update this store");

        const updatedStore = await db.store.update({
            where: {
                url: storeUrl,
                userId: user.id,
            },
            data: details,
        });

        return updatedStore;
    } catch (error) {
        throw error;
    }
}


// Function: getStoreShippingRates
// Description: Retrieves all countries and their shipping rates for a specific store.
//              If a country does not have a shipping rate, it is still included in the result with a null shippingRate.
// Permission Level: Public
// Returns: Array of objects where each object contains a country and its associated shippingRate, sorted by country name.
export const getStoreShippingRates = async (storeUrl: string) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    if (!storeUrl) throw new Error("Store URL is required.");

    const check_ownership = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });

    if (!store) throw new Error("Store could not be found.");

    const countries = await db.country.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const shippingRates = await db.shippingRate.findMany({
      where: {
        storeId: store.id,
      },
    });

    const rateMap = new Map();
    shippingRates.forEach((rate) => {
      rateMap.set(rate.countryId, rate);
    });

    const result = countries.map((country) => ({
      countryId: country.id,
      countryName: country.name,
      shippingRate: rateMap.get(country.id) || null,
    }));

    return result;
  } catch (error) {
    console.error("Error retrieving store shipping rates:", error);
    throw error;
  }
};

// Function: upsertShippingRate
// Description: Upserts a shipping rate for a specific country, updating if it exists or creating a new one if not.
// Permission Level: Seller only
// Parameters:
//   - storeUrl: Url of the store you are trying to update.
//   - shippingRate: ShippingRate object containing the details of the shipping rate to be upserted.
// Returns: Updated or newly created shipping rate details.
export const upsertShippingRate = async (
  storeUrl: string,
  shippingRate: ShippingRate
) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "SELLER")
      throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry."
      );

    const check_ownership = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });

    if (!check_ownership)
      throw new Error(
        "Make sure you have the permissions to update this store"
      );

    if (!shippingRate) throw new Error("Please provide shipping rate data.");

    if (!shippingRate.countryId)
      throw new Error("Please provide a valid country ID.");

    const store = await db.store.findUnique({
      where: {
        url: storeUrl,
        userId: user.id,
      },
    });
    if (!store) throw new Error("Please provide a valid store URL.");

    const shippingRateDetails = await db.shippingRate.upsert({
      where: {
        id: shippingRate.id,
      },
      update: { ...shippingRate, storeId: store.id },
      create: { ...shippingRate, storeId: store.id },
    });

    return shippingRateDetails;
  } catch (error) {
    console.error(error);
    throw error;
  }
};