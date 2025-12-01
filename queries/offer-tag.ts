"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { OfferTag } from "@/lib/generated/prisma/client";

// Function: getAllOfferTags
// Description: Retrieves all offer tags from the database.
// Permission Level: Public
// Returns: Array of offer tags sorted by updatedAt date in ascending order.
export const getAllOfferTags = async (storeUrl?: string) => {
  let storeId: string | undefined;

  if (storeUrl) {
    const store = await db.store.findUnique({
      where: { url: storeUrl },
    });

    if (!store) {
      return [];
    }

    storeId = store.id;
  }

  const offerTgas = await db.offerTag.findMany({
    where: storeId
      ? {
          products: {
            some: {
              storeId: storeId,
            },
          },
        }
      : {},
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      products: {
        _count: "desc",
      },
    },
  });
  return offerTgas;
};

// Function: upsertOfferTag
// Description: Upserts an offer tag into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only
// Parameters:
//   - offerTag: OfferTag object containing details of the offer tag to be upserted.
// Returns: Updated or newly created offer tag details.
export const upsertOfferTag = async (offerTag: OfferTag) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );

    if (!offerTag) throw new Error("Please provide offer tag data.");

    const existingOfferTag = await db.offerTag.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: offerTag.name }, { url: offerTag.url }],
          },
          {
            NOT: {
              id: offerTag.id,
            },
          },
        ],
      },
    });

    if (existingOfferTag) {
      let errorMessage = "";
      if (existingOfferTag.name === offerTag.name) {
        errorMessage = "An offer tag with the same name already exists";
      } else if (existingOfferTag.url === offerTag.url) {
        errorMessage = "An offer tag with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    const offerTagDetails = await db.offerTag.upsert({
      where: {
        id: offerTag.id,
      },
      update: offerTag,
      create: offerTag,
    });
    return offerTagDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Function: getOfferTag
// Description: Retrieves a specific OfferTag from the database.
// Access Level: Public
// Parameters:
//   - offerTagId: The ID of the OfferTag to be retrieved.
// Returns: Details of the requested OfferTag.
export const getOfferTag = async (offerTagId: string) => {
  if (!offerTagId) throw new Error("Please provide offer tag ID.");

  const offerTag = await db.offerTag.findUnique({
    where: {
      id: offerTagId,
    },
  });

  return offerTag;
};

// Function: deleteOfferTag
// Description: Deletes an offer tag from the database by its ID.
// Permission Level: Admin only
// Parameters:
//   - offerTagId: The ID of the offer tag to be deleted.
// Returns: A success message if the offer tag is deleted, or an error if it fails.
export const deleteOfferTag = async (offerTagId: string) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );

    if (!offerTagId) throw new Error("Please provide the offer tag ID.");

    const response = await db.offerTag.delete({
      where: {
        id: offerTagId,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};