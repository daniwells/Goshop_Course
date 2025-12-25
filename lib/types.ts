import { getAllSubCategories } from "@/queries/subCategory";
import { getAllStoreProducts } from "@/queries/product";
import { getStoreDefaultShippingDetails } from "@/queries/store";
import { ShippingRate } from "./generated/prisma/client";

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