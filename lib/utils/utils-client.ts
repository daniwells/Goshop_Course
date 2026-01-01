// "use server"

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import ColorThief from "colorthief";
import { CartProductType } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGridClassName = (length: number) => {
  switch(length){
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-2 grid-row-2";
    case 4:
      return "grid-cols-2 grid-row-1";
    case 5:
      return "grid-cols-2 grid-row-6";
    case 6:
      return "grid-cols-2";
    default:
      return "";
  }
}

export const getDominantColors = (imgUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 4).map((color) => {
          return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
        });
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
}

/*
  * Function: getShippingDatesRange
  * Description: Returns the shipping date range by adding the specified min and max days.
  * Parameters:
  *   - minDays: Minimum number of days to add to the current date.
  *   - maxDays: Maximum number of days to add to the current date.
  * Returns: Object containing minDate and maxDate.
*/
export const getShippingDatesRange = (
  minDays: number,
  maxDays: number
): {minDate: string, maxDate: string} => {
  const currentDate = new Date();

  const minDate = new Date(currentDate);
  minDate.setDate(currentDate.getDate() + minDays);

  const maxDate = new Date(currentDate);
  maxDate.setDate(currentDate.getDate() + maxDays);

  return {
    minDate: minDate.toDateString(),
    maxDate: minDate.toDateString(),
  }
}

export const isProductValidToAdd = (product: CartProductType): boolean => {
  const {
    productId,
    variantId,
    productSlug,
    variantSlug,
    name,
    variantName,
    image,
    quantity,
    price,
    sizeId,
    size,
    stock,
    shippingFee,
    extraShippingFee,
    shippingMethod,
    shippingService,
    variantImage,
    weight,
    deliveryTimeMin,
    deliveryTimeMax,
  } = product;

  if (
    !productId ||
    !variantId ||
    !productSlug ||
    !variantSlug ||
    !name ||
    !variantName ||
    !image ||
    quantity <= 0 ||
    price <= 0 ||
    !sizeId ||
    !size ||
    stock <= 0 ||
    weight <= 0 ||
    !shippingMethod ||
    !variantImage ||
    deliveryTimeMin < 0 ||
    deliveryTimeMax < deliveryTimeMin
  ) {
    return false;
  }

  return true;
};