"use client";

// React, Next.js
import { FC, useEffect } from "react"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Utils
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { v4 } from "uuid";

// Custom Components
import ImageUpload from "../shared/image-upload";

// Ui
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Prisma
import { Store } from "@/lib/generated/prisma/client";

// Lib
import { Button } from "@/components/ui/button";
import { StoreFormSchema } from "@/lib/schemas";

// Queries
import { upsertStore } from "@/queries/store";

interface StoreDetailsProps {
    data?: Store,
}

const StoreDetails: FC<StoreDetailsProps> = ({ data }) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof StoreFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(StoreFormSchema),
        defaultValues: {
            name: data?.name || "",
            description: data?.description || "",
            email: data?.email || "",
            phone: data?.phone || "",
            logo: data?.logo ? [{ url: data.logo }] : [],
            cover: data?.cover ? [{ url: data.cover }] : [],
            url: data?.url || "",
            featured: data?.featured ?? false,
            status: data?.status.toString() || "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if(data){
            form.reset({
                ...data,
                logo: data?.logo ? [{ url: data.logo }] : [],
                cover: data?.cover ? [{ url: data.cover }] : [],
            });
        }
    }, [data, form]);
    
    const handleSubmit = async () => {
        const values = form.getValues();

        try {
            const response = await upsertStore({
                id: data?.id ? data.id : v4(),
                name: values?.name,
                description: values?.description,
                email: values?.email,
                phone: values?.phone,
                logo: values?.logo[0].url,
                cover: values?.cover[0].url,
                url: values?.url,
                featured: values?.featured,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            toast.success(
                data?.id ? 
                    "Store has been updated." : 
                    `Congratulations! '${response?.name}' is now created.`
            );

            if(data?.id){
                router.refresh();
            }else{
                router.push(`/dashboard/seller/stores/${response.url}`);
            }
        } catch (error) {
            toast.error("Oops!", {
                description: error?.toString(),
            });
        }
    }

    return <AlertDialog>
        <Card className="w-full" >
            <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>{
                    data?.id ?
                    `Update ${data?.name} store information.` :
                    "Let's create a store. You can edit store settings later from the store table or the store page."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 "
                    >
                        {/* Logo - Cover */}
                        <div className="relative py-2 mb-24">
                            <FormField
                                control={form.control}
                                name="logo"
                                render={({ field })=>(
                                    <FormItem className="absolute -bottom-20 -left-48 z-10 inset-x-40">
                                        <FormControl className="bg-red" >
                                            <ImageUpload
                                                type="profile"
                                                value={field.value.map((logo) => logo.url)}
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
                                control={form.control}
                                name="cover"
                                render={({ field })=>(
                                    <FormItem>
                                        <FormControl className="bg-red" >
                                            <ImageUpload
                                                type="cover"
                                                value={field.value.map((cover) => cover.url)}
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
                        </div>
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="name"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>Store name</FormLabel>
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
                                <FormLabel>Store description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Description" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />
                        {/* Email - Phone */}
                        <div className="flex flex-col gap-6 md:flex-row">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="email"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Store email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} type="email"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="phone"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Store phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Phone" {...field} type="phone"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>

                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="url"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>Store url</FormLabel>
                                <FormControl>
                                    <Input placeholder="/store-url" {...field}/>
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
                                            This store will appear on the home page.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="cursor-pointer" >
                            {
                                isLoading ? "loading..."
                                : data?.id ? "Save store information" 
                                : "Create store"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>;
}

export default StoreDetails;