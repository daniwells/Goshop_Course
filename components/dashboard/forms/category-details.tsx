"use client";

// Libs
import { FC, useEffect } from "react"
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";

// Components
import ImageUpload from "../shared/image-upload";

// Shadcn
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Prisma
import { Category } from "@/lib/generated/prisma/client";

// Lib
import { Button } from "@/components/ui/button";
import { CategoryFormSchema } from "@/lib/schemas";

// Query
import { upsertCategory } from "@/queries/category";

interface CategoryDetailsProps {
    data?: Category,
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof CategoryFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(CategoryFormSchema),
        defaultValues: {
            name: data?.name || "",
            image: data?.image ? [{ url: data.image }] : [],
            url: data?.url || "",
            featured: data?.featured ?? false,
        },
    });

    const isLoading = form.formState.isSubmitting;

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
            });
        }
    }, [data, form])
    
    const handleSubmit = async () => {

        const values = form.getValues();

        try {
            console.log("Form values:", values);
            console.log("Type of name:", typeof values.name, values.name);
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
                    data?.id ?
                    `Update ${data?.name} category information.` :
                    "Let's create a category. You can edit category settings later from the category table or the category page."}
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
                                <FormLabel>Category name</FormLabel>
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
                                <FormLabel>Category url</FormLabel>
                                <FormControl>
                                    <Input placeholder="/category-url" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
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
                                            This category will appear on the home page
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="cursor-pointer" >
                            {
                                isLoading ? "loading..."
                                : data?.id ? "Save category information" 
                                : "Create category"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>;
}

export default CategoryDetails;