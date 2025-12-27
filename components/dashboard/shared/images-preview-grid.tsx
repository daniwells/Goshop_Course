// // React, Next.js
// import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
// import Image from "next/image";

// // Images
// import NoImageImg from "@/public/assets/images/no_image_2.png"

// // Utils
// // import { cn, getGridClassName } from "@/lib/utils";
// import { cn, getDominantColors, getGridClassName } from "@/lib/utils/utils-client";

// // Icons
// import { Trash } from "lucide-react";
// import ColorPalette from "./color-palette";

// interface ImagesPreviewGridProps {
//   images: { url: string }[];
//   onRemove: (value: string) => void;
//   colors?: { color: string }[];
//   setColors: Dispatch<SetStateAction<{ color: string }[]>>;
// }

// const ImagesPreviewGrid: FC<ImagesPreviewGridProps> = ({
//   images,
//   onRemove,
//   colors,
//   setColors,
// }) => {
//     let imagesLength = images.length;

//     const GridClassName = getGridClassName(imagesLength);

//     const [colorPalettes, setColorPalettes] = useState<string[][]>([]);

//     useEffect(() => {
//         const fecthColors = async () => {
//             const palettes = await Promise.all(
//             images.map(async (img) => {
//                 try {
//                 const colors = await getDominantColors(img.url);
//                 return colors;
//                 } catch (error) {
//                 return [];
//                 }
//             })
//         );
//         setColorPalettes(palettes);
//     };

//     if (imagesLength > 0) {
//         fecthColors();
//     }
//     }, [images]);

//     if (imagesLength === 0) {
//         return (
//             <div>
//             <Image
//                 src={NoImageImg}
//                 alt="No images available"
//                 width={500}
//                 height={600}
//                 className="rounded-md"
//             />
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl">
//             <div
//                 className={cn(
//                 "grid h-[800px] overflow-hidden bg-white rounded-md",
//                 GridClassName
//                 )}
//             >
//                 {images.map((img, i) => (
//                     <div
//                         key={i}
//                         className={cn(
//                             "relative group h-full w-full",
//                             `grid_${imagesLength}_image_${i + 1}`,
//                             {
//                                 "h-[266.66px]": images.length === 6,
//                             }
//                         )}
//                     >
//                         <Image
//                             src={img.url}
//                             alt=""
//                             width={800}
//                             height={800}
//                             className="w-full h-full object-cover object-top"
//                         />
//                         <div
//                             className={cn(
//                                 "absolute top-0 left-0 right-0 bottom-0 hidden group-hover:flex bg-white/55 cursor-pointer items-center justify-center flex-col gap-y-3 transition-all duration-500",
//                                 {
//                                 "!pb-[40%]": imagesLength === 1,
//                                 }
//                             )}
//                         >
//                             <ColorPalette
//                                 colors={colors}
//                                 setColors={setColors}
//                                 extractedColors={colorPalettes[i]}
//                             />
//                             <button
//                                 className="Btn"
//                                 type="button"
//                                 onClick={() => onRemove(img.url)}
//                             >
//                                 <div className="sign">
//                                     <Trash size={18} />
//                                 </div>
//                                 <div className="text">Delete</div>
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
    
// };

// export default ImagesPreviewGrid;

"use client";

import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";

// Components
import { Button } from "@/components/ui/button";
import ColorPalette from "./color-palette";

// MUI
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

// Images
import NoImageImg from "@/public/assets/images/no_image_2.png";

// Utils
import { getDominantColors } from "@/lib/utils/utils-client";

// Icons
import { X } from "lucide-react";
import { Delete } from "lucide-react";

interface ImagesPreviewGridProps {
  images: { url: string }[];
  onRemove: (value: string) => void;
  colors?: { color: string }[];
  setColors: Dispatch<SetStateAction<{ color: string }[]>>;
}

const ImagesPreviewGrid: FC<ImagesPreviewGridProps> = ({
  images,
  onRemove,
  colors,
  setColors,
}) => {
    const [colorPalettes, setColorPalettes] = useState<string[][]>([]);

    useEffect(() => {
        const fetchColors = async () => {
        const palettes = await Promise.all(
            images.map(async (img) => {
            try {
                return await getDominantColors(img.url);
            } catch {
                return [];
            }
            })
        );
        setColorPalettes(palettes);
        };

        if (images.length > 0) {
        fetchColors();
        }
    }, [images]);

    if (images.length === 0) {
        return (
            <Image
                src={NoImageImg}
                alt="No images available"
                width={500}
                height={600}
                className="rounded-md"
            />
        );
    }

    return (
        <ImageList
            cols={3}
            gap={10}
            sx={{
                width: "100%",
                maxHeight: 300,
                borderRadius: "8px",
                overflowY: "auto",
                padding: "10px",
            }}
            className="dark:bg-white"
            rowHeight={160}
        >
            {images.map((img, i) => (
                <ImageListItem
                    key={img.url}
                    sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    className="group"
                >
                    <Image
                        src={img.url}
                        alt=""
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                    />

                    <div className="
                        absolute inset-0 hidden group-hover:flex
                        bg-white/70 backdrop-blur-sm
                        items-center justify-center
                        flex-col gap-3
                        transition-all
                    ">
                        <ColorPalette
                            colors={colors}
                            setColors={setColors}
                            extractedColors={colorPalettes[i]}
                        />

                        <Button
                            type="button"
                            onClick={() => onRemove(img.url)}
                            className="Btn"
                        >
                            <div className="sign">
                                <X size={18} className="border-none text-white" />
                            </div>
                            <div className="text">Delete</div> 
                        </Button>
                    </div>
                </ImageListItem>
            ))}
        </ImageList>
    );
};

export default ImagesPreviewGrid;