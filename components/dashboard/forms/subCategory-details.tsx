"use client";

// Libs
import { FC, useEffect } from "react"
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Shared
import ImageUpload from "../shared/image-upload";

// Ui
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

// Prisma
import { Category, SubCategory } from "@/lib/generated/prisma/client";

// Lib
import { SubCategoryFormSchema } from "@/lib/schemas";

// Query
import { upsertCategory } from "@/queries/category";
import { SelectItem } from "@radix-ui/react-select";

interface SubCategoryDetailsProps {
    data?: SubCategory,
    categories: Category[];
}

const SubCategoryDetails: FC<SubCategoryDetailsProps> = ({ data, categories }) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof SubCategoryFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(SubCategoryFormSchema),
        defaultValues: {
            name: data?.name || "",
            image: data?.image ? [{ url: data.image }] : [],
            url: data?.url || "",
            featured: data?.featured ?? false,
            categoryId: data?.categoryId,
        },
    });

    const isLoading = form.formState.isSubmitting;

    const formData = form.watch();
    console.log("formData", )

    const allValues = form.watch();
    useEffect(() => {
        console.log("Form atualizado:", allValues);
    }, [allValues]);

    useEffect(() => {
        if(data){
            form.reset({
                name: data?.name || "",
                image: [{ url: data?.image }],
                url: data?.url || "",
                featured: data?.featured ?? false,
                categoryId: data?.categoryId,
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
                    "SubCategory has been updated." : 
                    `Congratulations! '${response?.name}' is now created.`
            );

            if(data?.id){
                router.refresh();
            }else{
                router.push("/dashboard/admin/subCategories");
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
                <CardTitle>SubCategory Information</CardTitle>
                <CardDescription>{
                    data?.id ?
                    `Update ${data?.name} subCategory information.` :
                    "Let's create a subCategory. You can edit subCategory settings later from the subCategory table or the subCategory page."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 "
                    >
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field })=>(
                                <FormItem className="flex justify-center">
                                    <FormControl className="bg-red" >
                                        <ImageUpload
                                            type="profile"
                                            value={field.value.map((image) => image.url)}
                                            disabled={isLoading}
                                            onChange={(url) =>
                                                field.onChange([{ url }])
                                            }
                                            onRemove={(url) =>
                                                field.onChange([
                                                    ...field.value.filter(
                                                        (current) => current.url !== url
                                                    )
                                                ])
                                            }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="name"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>SubCategory name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="url"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>SubCategory url</FormLabel>
                                <FormControl>
                                    <Input placeholder="/subCategory-url" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="categoryId"
                            render={({ field })=>(
                                <FormItem 
                                    className="flex-1"
                                >
                                    <FormLabel>Category</FormLabel>
                                    <Select 
                                        disabled={isLoading || categories.length == 0}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder="Select a category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {
                                                categories.map((category) => (
                                                    <SelectItem 
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="featured"
                            render={({ field })=>(
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Featured</FormLabel>
                                        <FormDescription>
                                            This subCategory will appear on the home page
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="cursor-pointer" >
                            {
                                isLoading ? "loading..."
                                : data?.id ? "Save subCategory information" 
                                : "Create subCategory"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>;
}

export default SubCategoryDetails;