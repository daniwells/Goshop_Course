"use server";

// Db
import { db } from "@/lib/db";

// Types
import { FreeShippingWithCountriesType, ProductPageType, ProductShippingDetailsType, ProductWithVariantType, RatingStatisticsType, ReviewsOrderType, SortOrder, VariantImageType, VariantSimplified } from "@/lib/types";
import { generateUniqueSlug } from "@/lib/utils/utils-server";
import { FreeShipping, Store } from "@/lib/generated/prisma/client";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Slugify
import slugify from "slugify";

// Cookies
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";

// Function: upsertProduct
// Description: Upserts a product and itsm variant into the database, ensuring proper association.
// Permission Level: Seller only
// Parameters:
// - product: product object containing details of the product to be upserted.
// - storeUrl: The URL of the store to which the product belongs.
// Returns: Newly created or updated product with product variant details.
export const upsertProduct = async (
  product: ProductWithVariantType,
  storeUrl: string
) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "SELLER")
        throw new Error(
            "Unauthorized Access: Seller Privileges Required for Entry."
        );

    if (!product) throw new Error("Please provide product data.");

    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });
    if (!store) throw new Error("Store not found.");

    const existingProduct = await db.product.findUnique({
      where: { id: product.productId },
    });

    const existingVariant = await db.productVariant.findUnique({
      where: { id: product.variantId },
    });

    if (existingProduct) {
      if (existingVariant) {
        // Update existing variant and product
      } else {
        await handleCreateVariant(product);
      }
    } else {
      await handleProductCreate(product, store.id);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const handleProductCreate = async (
  product: ProductWithVariantType,
  storeId: string
) => {
    const productSlug = await generateUniqueSlug(
        slugify(product.name, {
            replacement: "-",
            lower: true,
            trim: true,
        }),
        "product"
    );

    const variantSlug = await generateUniqueSlug(
        slugify(product.variantName, {
            replacement: "-",
            lower: true,
            trim: true,
        }),
        "productVariant"
    );

    const productData = {
        id: product.productId,
        name: product.name,
        description: product.description,
        slug: productSlug,
        store: { connect: { id: storeId } },
        category: { connect: { id: product.categoryId } },
        subCategory: { connect: { id: product.subCategoryId } },
        offerTag: { connect: { id: product.offerTagId } },
        brand: product.brand,
        specs: {
            create: product.product_specs.map((spec) => ({
                name: spec.name,
                value: spec.value,
            })),
        },
        questions: {
            create: product.questions.map((q) => ({
                question: q.question,
                answer: q.answer,
            })),
        },
        variants: {
            create: [
                {
                    id: product.variantId,
                    variantName: product.variantName,
                    variantDescription: product.variantDescription,
                    slug: variantSlug,
                    variantImage: product.variantImage,
                    sku: product.sku,
                    weight: product.weight,
                    keywords: product.keywords.join(","),
                    isSale: product.isSale,
                    saleEndDate: product.saleEndDate,
                    images: {
                        create: product.images.map((img) => ({
                        url: img.url,
                        })),
                    },
                    colors: {
                        create: product.colors.map((color) => ({
                            name: color.color,
                        })),
                    },
                    sizes: {
                        create: product.sizes.map((size) => ({
                        size: size.size,
                        price: size.price,
                        quantity: size.quantity,
                        discount: size.discount,
                        })),
                    },
                    specs: {
                        create: product.variant_specs.map((spec) => ({
                        name: spec.name,
                        value: spec.value,
                        })),
                    },
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                },
            ],
        },
        shippingFeeMethod: product.shippingFeeMethod,
        freeShippingForAllCountries: product.freeShippingForAllCountries,
        freeShipping: product.freeShippingForAllCountries
        ? undefined
        : product.freeShippingCountriesIds &&
            product.freeShippingCountriesIds.length > 0
        ? {
            create: {
                eligibaleCountries: {
                    create: product.freeShippingCountriesIds.map((country) => ({
                        country: { connect: { id: country.value } },
                    })),
                },
            },
        } : undefined,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };

    const new_product = await db.product.create({ data: productData });
    return new_product;
};

const handleCreateVariant = async (product: ProductWithVariantType) => {
    const variantSlug = await generateUniqueSlug(
        slugify(product.variantName, {
            replacement: "-",
            lower: true,
            trim: true,
        }),
        "productVariant"
    );

    const variantData = {
        id: product.variantId,
        productId: product.productId,
        variantName: product.variantName,
        variantDescription: product.variantDescription,
        slug: variantSlug,
        isSale: product.isSale,
        saleEndDate: product.isSale ? product.saleEndDate : "",
        sku: product.sku,
        keywords: product.keywords.join(","),
        weight: product.weight,
        variantImage: product.variantImage,
        images: {
        create: product.images.map((img) => ({
            url: img.url,
        })),
        },
        colors: {
        create: product.colors.map((color) => ({
            name: color.color,
        })),
        },
        sizes: {
        create: product.sizes.map((size) => ({
            size: size.size,
            price: size.price,
            quantity: size.quantity,
            discount: size.discount,
        })),
        },
        specs: {
        create: product.variant_specs.map((spec) => ({
            name: spec.name,
            value: spec.value,
        })),
        },
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };

    const new_variant = await db.productVariant.create({ data: variantData });
    return new_variant;
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
        },
        include: {
            questions: true,
            specs: true,
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
        offerTagId: product.offerTagId || undefined,
        shippingFeeMethod: product.shippingFeeMethod,
        questions: product.questions.map((q) => ({
            question:q.question, 
            answer:q.answer
        })),
        product_specs: product.specs.map((spec) => ({
            name:spec.name, 
            value:spec.value
        })),
    };
};

// Function: getProductVariant
// Description: Retrieves details of a specific product variant from the database.
// Access Level: Public
// Parameters:
//   - productId: The id of the product to which the variant belongs.
//   - variantId: The id of the variant to be retrieved.
// Returns: Details of the requested product variant.
export const getProductVariant = async (
  productId: string,
  variantId: string
) => {
  // Retrieve product variant details from the database
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      subCategory: true,
      variants: {
        where: {
          id: variantId,
        },
        include: {
          images: true,
          colors: {
            select: {
                id: true,
                name: true,
            },
          },
          sizes: {
            select: {
              size: true,
              quantity: true,
              price: true,
              discount: true,
            },
          },
        },
      },
    },
  });
  if (!product) return;
  return {
    productId: product?.id,
    variantId: product?.variants[0].id,
    name: product.name,
    description: product?.description,
    variantName: product.variants[0].variantName,
    variantDescription: product.variants[0].variantDescription || undefined,
    images: product.variants[0].images,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    isSale: product.variants[0].isSale,
    brand: product.brand,
    sku: product.variants[0].sku,
    colors: product.variants[0].colors.map((color) => ({
        id: color.id,
        color: color.name,
        name: color.name
    })),
    // colors: product.variants[0].colors,
    sizes: product.variants[0].sizes,
    keywords: product.variants[0].keywords.split(","),
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
            offerTag: true,
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

// Function: getProducts
// Description: Retrieves products based on various filters and returns only variants that match the filters. Supports pagination.
// Access Level: Public
// Parameters:
//   - filters: An object containing filter options (category, subCategory, offerTag, size, onSale, onDiscount, brand, color).
//   - sortBy: Sort the filtered results (Most popular, New Arivals, Top Rated...).
//   - page: The current page number for pagination (default = 1).
//   - pageSize: The number of products per page (default = 10).
// Returns: An object containing paginated products, filtered variants, and pagination metadata (totalPages, currentPage, pageSize, totalCount).
export const getProducts = async (
    filters: any = {},
    sortBy: string = "",
    page: number = 1,
    pageSize: number = 10
) => {
    const currentPage = page;
    const limit = pageSize;
    const skip = (currentPage - 1) * limit;

    const whereClause: any = {
        AND: [],
    };

    if(filters.store){
        const store = await db.store.findUnique({
            where: {
                url: filters.store,
            },
            select: { id:true },
        });

        if(store){
            whereClause.AND.push({ storeId: store.id });
        }
    }

    if(filters.category){
        const category = await db.category.findUnique({
            where: {
                url: filters.category,
            },
            select: { id:true },
        });

        if(category){
            whereClause.AND.push({ categoryId: category.id });
        }
    }

    if(filters.subCategory){
        const subCategory = await db.subCategory.findUnique({
            where: {
                url: filters.subCategory,
            },
            select: { id:true },
        });

        if(subCategory){
            whereClause.AND.push({ categoryId: subCategory.id });
        }
    }

    const products = await db.product.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        include: {
            variants: {
                include: {
                    sizes: true,
                    images: true,
                    colors: true,
                }
            }
        }
    });

    const ProductsWithFilteredVariants = products.map((product) => {
        const filteredVariants = product.variants;

        const variants:VariantSimplified[] = filteredVariants.map((variant) => (
            {
                variantId: variant.id,
                variantSlug: variant.slug,
                variantName: variant.variantName,
                images: variant.images,
                sizes: variant.sizes,
            }
        ));

        const variantImages: VariantImageType[] = filteredVariants.map((variant) => ({
            url: `/product/${product.slug}/${variant.slug}`,
            image: variant.variantImage ? variant.variantImage : variant.images[0].url,
        }));

        return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            rating: product.rating,
            sales: product.sales,
            variants,
            variantImages,
        }
    });

    // const totalCount = await db.product.count({
    //     where: whereClause,
    // });

    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
        products: ProductsWithFilteredVariants,
        totalPages,
        currentPage,
        pageSize,
        totalCount,
    }
};

// Function: getProductPageData
// Description: Retrieves details of a specific product variant from the database.
// Access Level: Public
// Parameters:
//   - productId: The slug of the product to which the variant belongs.
//   - variantId: The slug of the variant to be retrieved.
// Returns: Details of the requested product variant.
export const getProductPageData = async (
  productSlug: string,
  variantSlug: string
) => {
    const user = await currentUser();

    const product  = await retrieveProductDetails(productSlug, variantSlug);
    if(!product) return;

    const userCountry = await getUserCountry();

    const productShippingDetails = await getShippingDetails(
        product.shippingFeeMethod,
        userCountry,
        product.store,
        product.freeShipping,
    );

    const storeFollowersCount = await getStoreFollowersCount(product.storeId);

    const isUserFollowingStore = await checkIfUserFollowingStore(product.store.id, user?.id)

    const ratingStatistics = await getRatingStatistics(product.id);

    return formatProductResponse(
        product,
        productShippingDetails,
        storeFollowersCount,
        isUserFollowingStore,
        ratingStatistics,
    );
};

// Helpers Functions
const getUserCountry = async () => {
    const userCountryCookie = await getCookie("userCountry", { cookies }) || "";
    const defaultCountry = { name: "United States", code: "US" };

    try {
        const parsedCountry = JSON.parse(userCountryCookie);

        if(
            parsedCountry && 
            typeof parsedCountry === "object" && 
            "name" in parsedCountry && 
            "code" in parsedCountry
        ){
            return parsedCountry;
        }
        return defaultCountry;
    } catch (error) {
        console.error("Failed to parse userCountryCookie", error);
    }
}

export const retrieveProductDetails = async (productSlug: string, variantSlug: string) => {
    const product = await db.product.findUnique({
        where: {
            slug: productSlug,
        },
        include: {
            category: true,
            subCategory: true,
            offerTag: true,
            store: true,
            specs: true,
            questions: true,
            reviews: {
                include: {
                    images: true,
                    user: true,
                },
                take: 4,
            },
            freeShipping: {
                include: {
                    eligibaleCountries: true,
                }
            },
            variants: {
                where: {
                    slug: variantSlug,
                },
                include: {
                    images:true,
                    colors: true,
                    sizes: true,
                    specs: true,
                }
            }
        }
    });

    if(!product) return null;

    const variantsInfo = await db.productVariant.findMany({
        where: {
            productId: product?.id,
        },
        include: {
            images: true,
            sizes: true,
            colors: true,
            product: {
                select: {
                    slug: true,
                }
            }
        }
    });

    return {
        ...product,
        variantsInfo: variantsInfo.map((variant) =>({
            variantName: variant.variantName,
            variantSlug: variant.slug,
            variantImage: variant.variantImage,
            variantUrl: `/product/${productSlug}/${variant.slug}`,
            images: variant.images,
            sizes: variant.sizes,
            colors: variant.colors,

        }))
    };
}

export const formatProductResponse = async (
    product: ProductPageType,
    shippingDetails: ProductShippingDetailsType,
    storeFollowersCount: number,
    isUserFollowingStore: boolean,
    ratingStatistics: RatingStatisticsType,
) => {
    if(!product) return;

    const variant = product.variants[0];
    const { store, category, subCategory, offerTag, questions } = product;
    const { images, colors, sizes } = variant;

    return {
        productId: product.id,
        variantId: variant.id,
        productSlug: product.slug,
        variantSlug: variant.slug,
        name: product.name,
        description: product.description,
        variantName: variant.variantName,
        variantDescription: variant.variantDescription,
        images,
        category,
        subCategory,
        offerTag,
        isSale: variant.isSale,
        saleEndDate: variant.saleEndDate,
        brand: product.brand,
        sku: variant.sku,
        weight: variant.weight,
        store: {
            id: store.id,
            url: store.url,
            name: store.name,
            logo: store.logo,
            followersCount: storeFollowersCount,
            isUserfollowingStore: isUserFollowingStore,
        },
        colors,
        sizes,
        specs: {
            product: product.specs,
            variant: variant.specs
        },
        questions,
        rating: product.rating,
        reviews: product.reviews,
        reviewsStatistics: ratingStatistics,
        shippingDetails,
        reletadProducts: [],
        variantImage: variant.variantImage,
        variantsInfo: product.variantsInfo,
    }
}

const getStoreFollowersCount = async (storeId: string) => {
    const storeFollowersCount = await db.store.findUnique({
        where: {
            id: storeId,
        },
        select: {
            _count: {
                select: {
                    followers: true,
                }
            }
        }
    });

    return storeFollowersCount?._count.followers || 0;
}

const checkIfUserFollowingStore = async (storeId: string, userId: string | undefined) => {
    let isUserFollowingStore = false;
    if(!userId){
        const storeFollowersInfo = await db.store.findUnique({
            where: {
                id: storeId,
            },
            select: {
                followers: {
                    where: {
                        id: userId,
                    },
                    select: { id: true },
                }
            }
        });
        if(storeFollowersInfo && storeFollowersInfo.followers.length > 0){
            isUserFollowingStore = true;
        }
    }

    return isUserFollowingStore;
}

export const getRatingStatistics = async (productId: string) => {
    const ratingStats = await db.review.groupBy({
        by: ["rating"],
        where: { productId },
        _count: {
            rating: true,
        }
    });

    const totalReviews = ratingStats.reduce((sum, stat) => sum + stat._count.rating, 0);

    const ratingCounts = Array(5).fill(0);

    ratingStats.forEach((stat) => {
        let rating = Math.floor(stat.rating);

        if(rating >= 1 && rating <= 5){
            ratingCounts[rating - 1] = stat._count.rating;
        }
    });

    return {
        ratingStatistics:ratingCounts.map(( count, index ) => ({
            rating: index + 1,
            numReviews: count,
            percentage: totalReviews > 0 ? ( count / totalReviews ) * 100 : 0,
        })),
        reviewWithImagesCount: await db.review.count({
            where: {
                productId,
                images: { some: {} }
            }
        }),
        totalReviews
    }
}

// Function: getShippingDetails
// Description: Retrieves and calculates shipping details based on user country and product.
// Access Level: Public
// Parameters:
//   - shippingFeeMethod: The shipping fee method of the product.
//   - userCountry: The parsed user country object from cookies.
//   - store :  store details.
// Returns: Calculated shipping details.
export const getShippingDetails = async (
    shippingFeeMethod: string,
    userCountry: { name: string; code: string; city: string },
    store: Store,
    freeShipping?: FreeShippingWithCountriesType | null,
) => {
    let shippingDetails = {
        shippingFeeMethod,
        shippingService: "",
        shippingFee: 0,
        extraShippingFee: 0,
        deliveryTimeMin: 0,
        deliveryTimeMax: 0,
        returnPolicy: "",
        countryCode: userCountry.code,
        countryName: userCountry.name,
        city: userCountry.city,
        isFreeShipping: false,
    };

    const country = await db.country.findUnique({
        where: {
            name: userCountry.name,
            code: userCountry.code,
        }
    });

    if(country){
        const shippingRate = await db.shippingRate.findFirst({
            where: {
                countryId: country.id,
                storeId: store.id,
            }
        });

        const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
        const shippingService = shippingRate?.shippingService || store.defaultShippingService;
        const shippingFeePerItem = shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem;
        const shippingFeeForAdditionalItem = shippingRate?.shippingFeeForAdditionalItem || store.defaultShippingFeeForAdditionalItem;
        const shippingFeePerKg = shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg;
        const shippingFeeFixed = shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed;
        const deliveryTimeMin = shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin;
        const deliveryTimeMax = shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax;

        if(freeShipping){
            const free_shipping_countries = freeShipping.eligibaleCountries;
            const check_free_shipping = free_shipping_countries.find(
                (c) => c.countryId === country.id
            );

            if(check_free_shipping){
                shippingDetails.isFreeShipping = true;
            }
        }

        shippingDetails = {
            shippingFeeMethod,
            shippingService: shippingService,
            shippingFee: 0,
            extraShippingFee: 0,
            deliveryTimeMin,
            deliveryTimeMax,
            returnPolicy,
            countryCode: userCountry.code,
            countryName: userCountry.name,
            city: userCountry.city,
            isFreeShipping: shippingDetails.isFreeShipping,
        };

        const { isFreeShipping } = shippingDetails;
        switch(shippingFeeMethod){
            case "ITEM":
                shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerItem;
                shippingDetails.extraShippingFee = isFreeShipping ? 0 : shippingFeeForAdditionalItem;
                break;
            case "WEIGHT":
                shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerKg;
                break;
            case "FIXED":
                shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeeFixed;
                break;
            default:
                break;
        }

        return shippingDetails;
        
    }
    return false;
}

// Function: getProductFilteredReviews
// Description: Retrieves filtered and sorted reviews for a product from the database, based on rating, presence of images, and sorting options.
// Access Level: Public
// Parameters:
//   - productId: The ID of the product for which reviews are being fetched.
//   - filters: An object containing the filter options such as rating and whether reviews include images.
//   - sort: An object defining the sort order, such as latest, oldest, or highest rating.
//   - page: The page number for pagination (1-based index).
//   - pageSize: The number of reviews to retrieve per page.
// Returns: A paginated list of reviews that match the filter and sort criteria.
export const getProductFilteredReviews = async (
    productId: string, 
    filters: { rating?: number; hasImages?: boolean },
    sort: ReviewsOrderType | undefined,
    page: number = 1,
    pageSize: number = 4,
) => {
    const reviewFilter: any = {
        productId,
    };

    if(filters.rating) {
        const rating = filters.rating;
        reviewFilter.rating = {
            in: [ rating, rating + 0.5 ],
        }
    }

    if(filters.hasImages){
        reviewFilter.images = {
            some: {},
        }
    }

    const sortOption: { createdAt?: SortOrder; rating?: SortOrder } = 
        sort && sort.orderBy === "latest"
        ? { createdAt: "desc" }
        : sort && sort.orderBy === "oldest"
        ? { createdAt: "asc" }
        : { rating: "desc" };
    
    const skip = ( page - 1 ) * pageSize;
    const take = pageSize;

    const reviews = await db.review.findMany({
        where: reviewFilter,
        include: {
            images: true,
            user: true,
        },
        orderBy: sortOption,
        skip,
        take,
    });

    return reviews;
}