"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { CartProductType, Country } from "@/lib/types";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { getTouchRippleUtilityClass } from "@mui/material/ButtonBase";
import { getDeliveryDetailsForStoreByCountry, getShippingDetails } from "./product";
import { ShippingAddress } from "@/lib/generated/prisma/client";
import { FaCity } from "react-icons/fa";

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

/*
 * Function: saveUserCart
 * Description: Saves the user's cart by validating product data from the database and ensuring no frontend manipulation.
 * Permission Level: User who owns the cart
 * Parameters:
 *   - cartProducts: An array of product objects from the frontend cart.
 * Returns:
 *   - An object containing the updated cart with recalculated total price and validated product data.
 */
export const saveUserCart = async (cartProducts: CartProductType[]): Promise<boolean> => {
    const user = await currentUser();

    if(!user) throw new Error("Unauthenticated.");

    const userId = user.id;

    const userCart = await db.cart.findFirst({
        where: { userId },
    });

    if(userCart){
        await db.cart.delete({
            where: {
                userId,
            },
        })
    };

    const validatedCartItems = await Promise.all(cartProducts.map(async (cartProduct) => {
        const {
            productId,
            variantId,
            sizeId,
            quantity
        } = cartProduct;

        const product = await db.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                store: true,
                freeShipping: {
                    include: {
                        eligibaleCountries: true,
                    }
                },
                variants: {
                    where: {
                        id: variantId,
                    },
                    include: {
                        sizes: {
                            where: {
                                id: sizeId,
                            }
                        },
                        images: true,
                    }
                }
            }
        });

        if(!product || product.variants.length === 0 || product.variants[0].sizes.length === 0){
            throw new Error(
                `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
            );
        }

        const variant = product.variants[0];
        const size = variant.sizes[0];

        const validQuantity = Math.min(quantity, size.quantity);
        const price = size.discount 
            ? size.price - size.price * (size.discount / 100) 
            : size.price;

        const countryCookie = await getCookie("userCountry", { cookies });
        
        let details = {
            shippingFee: 0,
            extraShippingFee: 0,
            isFreeShipping: false,
        };

        if(countryCookie){
            const country = JSON.parse(countryCookie);
            const temp_details = await getShippingDetails(
                product.shippingFeeMethod,
                country,
                product.store,
                product.freeShipping
            );

            if(typeof temp_details !== "boolean"){
                details = temp_details;   
            }
        }

        let shippingFee = 0;
        const { shippingFeeMethod } = product;
        if(shippingFeeMethod === "ITEM"){
            shippingFee = quantity === 1
            ? details.shippingFee
            : details.shippingFee + details.extraShippingFee * (quantity - 1);
        }else if(shippingFeeMethod === "WEIGHT") {
            shippingFee = details.shippingFee * (variant.weight || 0) * quantity;
        }else if(shippingFeeMethod === "FIXED"){
            shippingFee = details.shippingFee;
        }

        const totalPrice = price * validQuantity + shippingFee;
       

        
        return {
            productId,
            variantId,
            productSlug: product.slug,
            variantSlug: variant.slug,
            sizeId,
            storeId: product.storeId,
            sku: variant.sku,
            name: `${product.name} - ${variant.variantName}`,
            image: variant.images[0].url,
            size: size.size,
            quantity: validQuantity,
            price,
            shippingFee,
            totalPrice,
        }   
    }));

    const subTotal = validatedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFees = validatedCartItems.reduce((acc, item) => acc + item.shippingFee, 0);

    const total = subTotal + shippingFees;

    const cart = await db.cart.create({
        data: {
            cartItems: {
                create: validatedCartItems.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    sizeId: item.sizeId,
                    storeId: item.storeId,
                    sku: item.sku,
                    productSlug: item.productSlug,
                    variantSlug: item.variantSlug,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    size: item.size,
                    price: item.price,
                    shippingFee: item.shippingFee,
                    totalPrice: item.totalPrice,
                })),
            },
            shippingFees,
            subTotal,
            total,
            userId,
        },
    });

    if (cart) return true;

    return false;
}

// Function: getUserShippingAddresses
// Description: Retrieves all shipping addresses for a specific user.
// Permission Level: User who owns the addresses
// Parameters: None
// Returns: List of shipping addresses for the user.
export const getUserShippingAddresses = async () => {
    try {
        const user = await currentUser();

        if (!user) throw new Error("Unauthenticated.");

        const shippingAddresses = await db.shippingAddress.findMany({
            where: {
                userId: user.id,
            },
            include: {
                country: true,
                user: true,
            },
        });

        return shippingAddresses;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const upsertShippingAddress = async (address: ShippingAddress) => {
    try {
        const user = await currentUser();

        if(!user) throw new Error("Unauthenticated.");
        if(!address) throw new Error("Please provide address data.");

        if(address.default){
            const addressDB = await db.shippingAddress.findUnique({
                where: { id: address.id }
            });

            if(addressDB){
                try {
                    await db.shippingAddress.updateMany({
                        where: {
                            userId: user.id,
                            default: true,
                        },
                        data: {
                            default: false,
                        },
                    });
                } catch (error) {
                    console.error("Error resetting default shipping addresses:", error);
                    throw new Error("Could not reset default shipping addresses");
                }
            }
        }

        const upsertedAddress = await db.shippingAddress.upsert({
            where: {
                id: address.id,
            },
            update: {
                ...address,
                userId: user.id,
            },
            create:{
                ...address,
                userId: user.id
            }
        });

        return upsertedAddress;
    } catch (error) {
        console.error("Error upserting shipping address: ", error);
        throw error;
    }
}

export const placeOrder = async (
    shippingAddress: ShippingAddress,
    cartId: string
): Promise<{orderId: string}> => {
    const user = await currentUser();
    if(!user) throw new Error("Unauthenticated.");

    const userId = user.id;

    const cart = await db.cart.findUnique({
        where: {
            id: cartId,
        },
        include: {
            cartItems: true,
        }
    });


    if(!cart) throw new Error("Cart not found.");

    const cartItems = cart.cartItems;

    const validatedCartItems = await Promise.all(cartItems.map(async (cartProduct) => {
        const {
            productId,
            variantId,
            sizeId,
            quantity
        } = cartProduct;

        const product = await db.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                store: true,
                freeShipping: {
                    include: {
                        eligibaleCountries: true,
                    }
                },
                variants: {
                    where: {
                        id: variantId,
                    },
                    include: {
                        sizes: {
                            where: {
                                id: sizeId,
                            }
                        },
                        images: true,
                    }
                }
            }
        });

        if(!product || product.variants.length === 0 || product.variants[0].sizes.length === 0){
            throw new Error(
                `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
            );
        }

        const variant = product.variants[0];
        const size = variant.sizes[0];

        const validQuantity = Math.min(quantity, size.quantity);
        const price = size.discount 
            ? size.price - size.price * (size.discount / 100) 
            : size.price;

        const countryId = shippingAddress.countryId;
        const temp_country = await db.country.findUnique({
            where: {
                id: countryId,
            }
        });

        const country: Country = {
            name: temp_country!.name,
            code: temp_country!.code,
            city: "",
            region: "",
        }

        if(!temp_country)
            throw new Error("Failed to get Shipping details for order."); 
        
        let details = {
            shippingFee: 0,
            extraShippingFee: 0,
            isFreeShipping: false,
        };

        if(country){
            const temp_details = await getShippingDetails(
                product.shippingFeeMethod,
                country,
                product.store,
                product.freeShipping
            );

            if(typeof temp_details !== "boolean"){
                details = temp_details;   
            }
        }

        let shippingFee = 0;
        const { shippingFeeMethod } = product;
        if(shippingFeeMethod === "ITEM"){
            shippingFee = quantity === 1
            ? details.shippingFee
            : details.shippingFee + details.extraShippingFee * (quantity - 1);
        }else if(shippingFeeMethod === "WEIGHT") {
            shippingFee = details.shippingFee * (variant.weight || 0) * quantity;
        }else if(shippingFeeMethod === "FIXED"){
            shippingFee = details.shippingFee;
        }

        const totalPrice = price * validQuantity + shippingFee;
       
        return {
            productId,
            variantId,
            productSlug: product.slug,
            variantSlug: variant.slug,
            sizeId,
            storeId: product.storeId,
            sku: variant.sku,
            name: `${product.name} - ${variant.variantName}`,
            image: variant.images[0].url,
            size: size.size,
            quantity: validQuantity,
            price,
            shippingFee,
            totalPrice,
        }   
    }));

    type GroupedItems = {[storeId: string]: typeof validatedCartItems};

    const groupedItems = validatedCartItems.reduce<GroupedItems>((acc, item) => {
        if(!acc[item.storeId]) acc[item.storeId] = [];
        return acc;
    }, {} as GroupedItems);

    const order = await db.order.create({
        data: {
            userId: userId,
            shippingAddressId: shippingAddress.id,
            orderStatus: "Pending",
            paymentStatus: "Pending",
            subTotal: 0,
            shippingFees: 0,
            total: 0,
        }
    });

    let orderTotalPrice = 0;
    let orderShippingFee = 0;

    for (const [storeId, items] of Object.entries(groupedItems)){
        const groupedTotalPrice = items.reduce(
            (acc, item) => acc + item.totalPrice, 0
        );

        const groupShippingFees = items.reduce(
            (acc, item) => acc + item.shippingFee, 0
        );

        const { 
            shippingService,
            deliveryTimeMin,
            deliveryTimeMax,
        } = await getDeliveryDetailsForStoreByCountry(storeId, shippingAddress.countryId)

        const orderGroup = await db.orderGroup.create({
            data: {
                orderId: order.id,
                storeId,
                status: "Pending",
                subTotal: groupedTotalPrice - groupShippingFees,
                shippingFees: groupShippingFees,
                total: groupedTotalPrice,
                shippingService: shippingService || "International Delivery",
                shippingDeliveryMin: deliveryTimeMin || 7,
                shippingDeliveryMax: deliveryTimeMax || 30,
            }
        });

        for(const item of items){
            await db.orderItem.create({
                data: {
                    orderGroupId: orderGroup.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    sizeId: item.sizeId,
                    productSlug: item.productSlug,
                    variantSlug: item.variantSlug,
                    sku: item.sku,
                    name: item.name,
                    image: item.image,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    shippingFee: item.shippingFee,
                    totalPrice: item.totalPrice,
                }
            });
        }        
        orderTotalPrice += groupedTotalPrice;
        orderShippingFee += groupShippingFees;
    }
    
    await db.order.update({
        where: {
            id: order.id,
        },
        data: {
            subTotal: orderTotalPrice - orderShippingFee,
            shippingFees: orderShippingFee,
            total: orderTotalPrice,
        }
    });

    // await db.cart.delete({
    //     where: {
    //         id: cartId,
    //     }
    // });

    return {
        orderId: order.id
    };
}

export const emptyUserCart = async () => {
    try {
        const user = await currentUser();
        if(!user) throw new Error("Unauthenticated.");
    
        const userId = user.id;
    
        const res = await db.cart.delete({
            where: {
                userId,
            }
        });
    
        if(res) return true;
    } catch (error) {
        throw error;
    }
}

/*
 * Function: updateCartWithLatest
 * Description: Keeps the cart updated with latest info (price,qty,shipping fee...).
 * Permission Level: Public
 * Parameters:
 *   - cartProducts: An array of product objects from the frontend cart.
 * Returns:
 *   - An object containing the updated cart with recalculated total price and validated product data.
 */
export const updateCartWithLatest = async (
    cartProducts: CartProductType[]
): Promise<CartProductType[]> => {
    
    const validatedCartItems = await Promise.all(
        cartProducts.map(async (cartProduct) => {
            const { productId, variantId, sizeId, quantity } = cartProduct;

            const product = await db.product.findUnique({
                where: {
                    id: productId,
                },
                include: {
                    store: true,
                    freeShipping: {
                        include: {
                            eligibaleCountries: true,
                        }
                    },
                    variants: {
                        where: {
                            id: variantId,
                        },
                        include: {
                            sizes: {
                                where: {
                                    id: sizeId,
                                },
                            },
                            images: true,
                        }
                    }
                }
            });

            if(!product || product.variants.length === 0 || product.variants[0].sizes.length === 0){
                throw new Error(
                    `Invalid product, variant, or size combination for productId ${productId}, variantId ${variantId}, sizeId ${sizeId}`
                );
            }

            const variant = product.variants[0];
            const size = variant.sizes[0];

            const countryCookie = await getCookie("userCountry", { cookies });

            let details = {
                shippingService: product.store.defaultShippingService,
                shippingFee: 0,
                extraShippingFee: 0,
                isFreeShipping: false,
                deliveryTimeMin: 0,
                deliveryTimeMax: 0,
            };

            if(countryCookie){
                const country = JSON.parse(countryCookie);
                const temp_details = await getShippingDetails(
                    product.shippingFeeMethod,
                    country,
                    product.store,
                    product.freeShipping
                );

                if(typeof temp_details !== "boolean"){
                    details = temp_details;
                }
            }

            const price = size.discount ? size.price - (size.price * size.discount)/100 : size.price;
            
            const validated_qty = Math.min(quantity, size.quantity);

            return {
                productId,
                variantId,
                productSlug: product.slug,
                variantSlug: variant.slug,
                sizeId,
                sku: variant.sku,
                name: product.name,
                variantName: variant.variantName,
                image: variant.images[0].url,
                variantImage: variant.variantImage,
                stock: size.quantity,
                weight: variant.weight ?? 0,
                shippingMethod: product.shippingFeeMethod,
                size: size.size,
                quantity: validated_qty,
                price,
                shippingService: details.shippingService,
                shippingFee: details.shippingFee,
                extraShippingFee: details.extraShippingFee,
                deliveryTimeMin: details.deliveryTimeMin,
                deliveryTimeMax: details.deliveryTimeMax,
                isFreeShipping: details.isFreeShipping,
            };
        })
    );

    return validatedCartItems;
}