import { getAllSubCategories } from "@/queries/subCategory";
import { getAllStoreProducts, getShippingDetails } from "@/queries/product";
import { getStoreDefaultShippingDetails } from "@/queries/store";
import { FreeShipping, FreeShippingCountry, ShippingRate } from "./generated/prisma/client";
import countries from "@/data/countries.json";
import { getProducts } from "@/queries/product";
import { ProductVariantImage, Size } from "./generated/prisma/client";
import { retrieveProductDetails, formatProductResponse } from "@/queries/product";

export interface DashboardSidebarMenuInterface {
    label: string;
    icon: string;
    link: string;    
}

// SubCategory + parent category
export type SubCategoryWithCategoryType = Awaited<
  ReturnType<typeof getAllSubCategories>
>[0];

// Product + variant
export type ProductWithVariantType = {
  productId: string;
  variantId: string;
  name: string;
  description: string;
  variantName: string;
  variantDescription: string;
  variantImage: string;
  images: { url: string }[];
  categoryId: string;
  subCategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  brand: string;
  sku: string;
  colors: { color: string }[];
  sizes: { size: string; quantity: number; price: number; discount: number; }[];
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  product_specs: { name: string; value: string }[];
  variant_specs: { name: string; value: string }[];
  questions: {question: string, answer: string}[];
  offerTagId: string;
  weight: number;
};

export type StoreProductType = Awaited<
  ReturnType<typeof getAllStoreProducts>
>[0];

export type StoreDefaultShippingDetailsType = Awaited<
  ReturnType<typeof getStoreDefaultShippingDetails>
>;

export type CountryWithShippingRatesType = {
  countryId: string;
  countryName: string;
  shippingRate: ShippingRate;
}

export interface Country {
  name: string;
  code: string;
  city: string;
  region: string;
}

export type SelectMenuOption = (typeof countries)[number];

export type ProductType = Awaited<
  ReturnType<typeof getProducts>
>["products"][0];

export type VariantSimplified = {
  variantId: string;
  variantSlug: string;
  variantName: string;
  images: ProductVariantImage[];
  sizes: Size[];
}

export type VariantImageType = {
  url: string;
  image: string;
}

export type ProductPageType = Awaited<
  ReturnType<typeof retrieveProductDetails>
>;

export type ProductPageDataType = Awaited<
  ReturnType<typeof formatProductResponse>
>;

export type ProductShippingDetailsType = Awaited<
  ReturnType<typeof getShippingDetails>
>;

export type FreeShippingWithCountriesType = FreeShipping & {
  eligibaleCountries: FreeShippingCountry[];
}

export type CartProductType = {
  productId: string;
  variantId: string;
  productSlug: string;
  variantSlug: string;
  name: string;
  variantName: string;
  image: string;
  variantImage: string;
  sizeId: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
  weight: number;
  shippingMethod: string;
  shippingService: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isFreeShipping: boolean;
};