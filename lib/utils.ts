import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const generateUniqueSlug = async (
//   baseSlug: string,
//   model: keyof PrismaClient,
//   field: string = "slug",
//   separator: string = "-"
// ) => {
//   let slug = baseSlug;
//   let suffix = 1;

//   while (true) {
//     const exisitngRecord = await (db[model] as any).findFirst({
//       where: {
//         [field]: slug,
//       },
//     });
//     if (!exisitngRecord) {
//       break;
//     }
//     slug = `${slug}${separator}${suffix}`;
//     suffix += 1;
//   }
//   return slug;
// };

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

