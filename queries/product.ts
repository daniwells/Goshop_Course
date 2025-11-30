"use server";

// Db
import { db } from "@/lib/db";

// Types
import { ProductWithVariantType } from "@/lib/types";
import { generateUniqueSlug } from "@/lib/utils/utils-server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Slugify
import slugify from "slugify";

// Function: upsertProduct
// Description: Upserts a product and itsm variant into the database, ensuring proper association.
// Permission Level: Seller only
// Parameters:
// - product: product object containing details of the product to be upserted.
// - storeUrl: The URL of the store to which the product belongs.
// Returns: Newly created or updated product with product variant details.
export const upsertProduct = async (product: ProductWithVariantType, storeUrl: string) => {
    try {
        const user = await currentUser();

        if(!user) throw new Error("Unauthenticated.");
        if(user.privateMetadata.role !== "SELLER")
            throw new Error("Unauthorized Access: Seller Privileges Required for Entry.");
        if(!product) throw new Error('Please provide product data.');

        const existingProduct = await db.product.findFirst({
            where: { id: product.productId }
        });

        const store = await db.store.findUnique(
            {where: { url: storeUrl || "" }}
        );

        if(!store) throw new Error("Store not found.");
        
        const productSlug = await generateUniqueSlug(
            slugify(product.name, {
                replacement: "-",
                lower: true,
                trim: true,
            }),
            "product",
        );
        
        const variantSlug = await generateUniqueSlug(
            slugify(product.variantName, {
                replacement: "-",
                lower: true,
                trim: true,
            }),
            "productVariant",
        );
        
        const commonProductData = {
            name: product.name,
            description: product.description,
            slug: productSlug,
            brand: product.brand,
            store: {connect: { id: store.id }},
            category: {connect: { id: product.productId }},
            subCategory: {connect: { id: product.subCategoryId }},
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            questions: {
                create: product.questions.map((question)=> ({
                    question: question.question,
                    answer: question.answer,
                })),
            },
            specs: {
                create: product.product_specs.map((spec)=> ({
                    name: spec.name,
                    value: spec.value,
                })),
            },

        }

        const commonVariantData = {
            variantName: product.variantName,
            variantDescription: product.variantDescription,
            slug: variantSlug,
            isSale: product.isSale,
            sku: product.sku,
            keywords: product.keywords.join(","),
            images: {
                create: product.images.map((images) => ({
                    url: images.url,
                    alt: images.url.split("/").pop() || "",
                }))
            },
            variantImage: product.variantImage,
            colors: {
                create: product.colors.map((color) => ({
                    name: color.color
                }))
            },
            sizes: {
                create: product.sizes.map((size)=> ({
                    size: size.size,
                    quantity: size.quantity,
                    price: size.price,
                    discount: size.discount,
                })),
            },
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            specs: {
                create: product.variant_specs.map((spec)=> ({
                    name: spec.name,
                    value: spec.value,
                })),
            },
            saleEndDate: product.isSale ? product.saleEndDate : ""
        };

        if(existingProduct){
            const variantData = {
                ...commonVariantData,
                product: { connect: { id: product.productId }},
            };

            return await db.productVariant.create({ data: variantData });
        }
        
        const productData = {
            ...commonProductData,
            id: product.productId,
            variants: {
                create: [{
                    id: product.variantId,
                    ...commonVariantData,
                }]
            }
        };
        
        return await db.product.create({ data: productData });
    } catch (error) {   
        console.log(error);
        throw error;
    }
};

// Function: getProductMainInfo
// Description: Retrieves the main information of a specific product from the database.
// Permission Level: Public
// Parameters:
// - productId: The ID of the product to be retrieved.
// Returns: An object containing the main information of the product or null if the product is not found.
export const getProductMainInfo = async (productId: string) => {
    const product = await db.product.findUnique({
        where: {
            id: productId,
        }
    });

    if(!product) return null;

    return {
        productId: product.id,
        name: product.name,
        description: product.description,
        brand: product.brand,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        storeId: product.storeId,
    };
};

// Function: getAllStoreProducts
// Description: Retrieves all products from a specific store based on the store URL.
// Permission Level: Public
// Parameters:
// - storeUrl: The URL of the store whose products are to be retrieved.
// Returns: An object containing the main information of the product or null if the product is not found.
export const getAllStoreProducts = async (storeUrl: string) => {
    if (!storeUrl) {
        throw new Error("Store URL param is missing.");
    }

    const store = await db.store.findUnique({
        where: {url: storeUrl}
    });

    if(!store) throw new Error("Please provide a valid store URL.");

    const products = await db.product.findMany({
        where: {
            storeId: store.id,
        },
        include: {
            category: true,
            subCategory: true,
            variants: {
                include: {
                    images: true,
                    colors: true,
                    sizes: true,
                }
            },
            store: {
                select: {
                    id: true,
                    url: true,
                }
            }
        },
    });

    return products;
}

// Function: deleteProduct
// Description: Deletes a product from the database.
// Permission Level: Seller only
// Parameters:
// - productId: The ID of the product to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteProduct = async (productId: string) => {
    const user = await currentUser();

    if(!user) throw new Error("Unauthenticated.");
    if(user.privateMetadata.role !== "SELLER")
        throw new Error("Unauthorized Access: Seller Privileges Required for Entry.");
    if(!productId) throw new Error('Please provide product id.');

    const response = await db.product.delete({ where: { id: productId } });
    return response;
}