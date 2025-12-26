import { PrismaClient } from "../generated/prisma/client";
import { db } from "../db";
import { Country } from "../types";
import countries from "@/data/countries.json";

export const generateUniqueSlug = async (
  baseSlug: string,
  model: keyof PrismaClient,
  field: string = "slug",
  separator: string = "-"
) => {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const exisitngRecord = await (db[model] as any).findFirst({
      where: {
        [field]: slug,
      },
    });
    if (!exisitngRecord) {
      break;
    }
    slug = `${slug}${separator}${suffix}`;
    suffix += 1;
  }
  return slug;
};

const DEFAULT_COUNTRY: Country = {
  name: "United States",
  code: "US",
  city: "",
  region: "",
}

export async function getUserCountry(): Promise<Country>{
  let userCountry: Country = DEFAULT_COUNTRY;

  try {
    const response = await fetch(`https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`);

    if(response.ok){
      const data = await response.json();
      console.log(data)
      userCountry = {
        name: countries.find((c) => c.code===data.country)?.name || data.country,
        code: data.country,
        city: data.city,
        region: data.region
      };
    }
  } catch (error) {
    console.error("Failed to fetch IP info", error);
  }

  return userCountry;
}