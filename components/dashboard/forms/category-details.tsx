"use client";

// Libs
import { FC, useEffect } from "react"
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Components
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/lib/generated/prisma/client";

// Lib
import { Button } from "@/components/ui/button";
import { CategoryFormSchema } from "@/lib/schemas";

interface CategoryDetailsProps {
    data?: Category
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
    const form = useForm<z.output<typeof CategoryFormSchema>>({
        mode: "onChange", // Form validation mode
        resolver: zodResolver(CategoryFormSchema),
        defaultValues: {
           name: data?.name,
           image: data?.image ? [{url: data?.image}] : [],
           url: data?.url,
           featured: data?.featured,
        }
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if(data){
            form.reset({
                name: data?.name,
                image: [{ url: data?.image }],
                url: data?.url,
                featured: data?.featured,
            });
        }
    }, [data, form])

    const handleSubmit=async(values:z.infer<typeof CategoryFormSchema>)=>{
        console.log(values);
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
                        className="space-y-4"
                    >
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
                                <FormLabel>Category name</FormLabel>
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
                                isLoading ? "loading"
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