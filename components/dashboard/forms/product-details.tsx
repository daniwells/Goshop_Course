"use client";

// React, Next.js
import { FC, useEffect, useState } from "react"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Utils
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";
import { toast } from "sonner";

// Custom components
import ImageUpload from "../shared/image-upload";
import ImagesPreviewGrid from "../shared/images-preview-grid";

// Ui
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Prisma
import { Category, SubCategory } from "@/lib/generated/prisma/client";

// Lib
import { Button } from "@/components/ui/button";
import { ProductFormSchema } from "@/lib/schemas";

// Query
import { upsertCategory } from "@/queries/category";

// Types
import { ProductWithVariantType } from "@/lib/types";

interface ProductDetailsProps {
    data?: ProductWithVariantType;
    categories: Category[];
    storeUrl: String;
}

const ProductDetails: FC<ProductDetailsProps> = ({ 
    data,
    categories,
    storeUrl
}) => {
    const router = useRouter();

    const [subCategories, setSubcategories] = useState<SubCategory[]>([]);
    const [colors, setColors] = useState<{ color: string }[]>([{color: ""}]);

    const [images, setImages] = useState<{ url: string }[]>([]);

    const form = useForm<z.infer<typeof ProductFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(ProductFormSchema),
        defaultValues: {
            name: data?.name,
            description: data?.description,
            variantName: data?.variantName,
            variantDescription: data?.variantDescription,
            images: data?.images ? data.images : [],
            categoryId: data?.categoryId,
            subCategoryId: data?.subCategoryId,
            brand: data?.brand,
            sku: data?.sku,
            colors: data?.colors || [{ color: "" }],
            sizes: data?.sizes,
            keywords: data?.keywords,
            isSale: data?.isSale,
        },
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if(data){
            form.reset({
                name: data?.name,
                description: data?.description,
                variantName: data?.variantName,
                variantDescription: data?.variantDescription,
                images: data?.images,
                categoryId: data?.categoryId,
                subCategoryId: data?.subCategoryId,
                brand: data?.brand,
                sku: data?.sku,
                colors: data?.colors || [{ color: "" }],
                sizes: data?.sizes,
                keywords: data?.keywords,
            });
        }
    }, [data, form])
    
    const handleSubmit = async () => {

        const values = form.getValues();

        try {
            const response = await upsertCategory({
                id: data?.id ? data.id : v4(),
                name: values.name,
                image: values.image[0]?.url || "",
                url: values.url,
                featured: values.featured,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            toast.success(
                data?.id ? 
                    "Category has been updated." : 
                    `Congratulations! '${response?.name}' is now created.`
            );

            if(data?.id){
                router.refresh();
            }else{
                router.push("/dashboard/admin/categories");
            }
        } catch (error) {
            console.log(error);
            toast.error("Oops!", {
                description: error?.toString(),
            });
        }
    }

    return <AlertDialog>
        <Card className="w-full" >
            <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>{
                    data?.productId && data?.variantId ?
                    `Update ${data?.name} product information.` :
                    "Let's create a product. You can edit product settings later from the product page."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 "
                    >
                        <div className="flex flex-col gap-y-6 xl:flex-row">
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field })=>(
                                    <FormItem>
                                        <FormControl className="bg-red" >
                                            <div>
                                                <ImagesPreviewGrid
                                                    images={form.getValues().images}
                                                    onRemove={(url) => {
                                                    const updatedImages = images.filter(
                                                        (img) => img.url !== url
                                                    );
                                                    setImages(updatedImages);
                                                    field.onChange(updatedImages);
                                                    }}
                                                    // colors={colors}
                                                    // setColors={setColors}
                                                />
                                                <FormMessage className="!mt-4" />
                                                <ImageUpload
                                                    dontShowPreview
                                                    type="standard"
                                                    value={field.value.map((image) => image.url)}
                                                    disabled={isLoading}
                                                    onChange={(url) => {
                                                    setImages((prevImages) => {
                                                        const updatedImages = [...prevImages, { url }];
                                                        field.onChange(updatedImages);
                                                        return updatedImages;
                                                    });
                                                    }}
                                                    onRemove={(url) =>
                                                    field.onChange([
                                                        ...field.value.filter(
                                                        (current) => current.url !== url
                                                        ),
                                                    ])
                                                    }
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="name"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>Product name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="description"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>Product description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Description" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <Button type="submit" disabled={isLoading} className="cursor-pointer" >
                            {
                                isLoading ? "loading..."
                                : data?.productId && data.variantId ? "Save product information" 
                                : "Create product"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>;
}

export default ProductDetails;