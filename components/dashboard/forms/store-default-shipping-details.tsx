"use client";

// React, Nextjs
import { FC, useEffect } from "react"
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Libraries
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";

// Components
import { NumberInput } from "@tremor/react";

// Shadcn
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Types
import { StoreDefaultShippingDetailsType } from "@/lib/types";

// Lib
import { Button } from "@/components/ui/button";
import { StoreShippingFormSchema } from "@/lib/schemas";

// Query
import { updateStoreDefaultShippingDetails } from "@/queries/store";

interface StoreDefaultShippingDetailsProps {
    data?: StoreDefaultShippingDetailsType,
    storeUrl: string,
}

const StoreDefaultShippingDetails: FC<StoreDefaultShippingDetailsProps> = ({ data, storeUrl }) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof StoreShippingFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(StoreShippingFormSchema),
        defaultValues: {
            defaultShippingService: data?.defaultShippingService || "",
            defaultShippingFeePerItem: data?.defaultShippingFeePerItem,
            defaultShippingFeeForAdditionalItem: data?.defaultShippingFeeForAdditionalItem,
            defaultShippingFeePerKg: data?.defaultShippingFeePerKg,
            defaultShippingFeeFixed: data?.defaultShippingFeeFixed,
            defaultDeliveryTimeMin: data?.defaultDeliveryTimeMin,
            defaultDeliveryTimeMax: data?.defaultDeliveryTimeMax,
            returnPolicy: data?.returnPolicy,
        },
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if(data){
            form.reset(data);
        }
    }, [data, form])
    
    const handleSubmit = async () => {

        const values = form.getValues();

        try {
            const response = await updateStoreDefaultShippingDetails(storeUrl, {
                defaultShippingService: values?.defaultShippingService,
                defaultShippingFeePerItem: values?.defaultShippingFeePerItem,
                defaultShippingFeeForAdditionalItem: values?.defaultShippingFeeForAdditionalItem,
                defaultShippingFeePerKg: values?.defaultShippingFeePerKg,
                defaultShippingFeeFixed: values?.defaultShippingFeeFixed,
                defaultDeliveryTimeMin: values?.defaultDeliveryTimeMin,
                defaultDeliveryTimeMax: values?.defaultDeliveryTimeMax,
                returnPolicy: values?.returnPolicy,
            });
            
            if(response.id)
                toast.success("Store default shipping details has been updated"); 
            
            router.refresh();
        } catch (error) {
            toast.error("Oops!", {
                description: error?.toString(),
            });
        }
    }

    return <AlertDialog>
        <Card className="w-full" >
            <CardHeader>
                <CardTitle>Store Default Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 "
                    >
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="defaultShippingService"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>Shipping service name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />

                        <div className="flex flex-wrap gap-4">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="defaultShippingFeePerItem"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee per item</FormLabel>
                                    <FormControl>
                                        <NumberInput 
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={0}
                                            step={0.01}
                                            className="pl-2 shadow-none rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="defaultShippingFeeForAdditionalItem"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee for additional item</FormLabel>
                                    <FormControl>
                                        <NumberInput 
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={0}
                                            step={0.1}
                                            className="pl-2 shadow-none rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="defaultShippingFeePerKg"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee per kg</FormLabel>
                                    <FormControl>
                                        <NumberInput 
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={0}
                                            step={0.1}
                                            className="pl-2 shadow-none rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="defaultShippingFeeFixed"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Fixed shipping fee</FormLabel>
                                    <FormControl>
                                        <NumberInput 
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={0}
                                            step={0.1}
                                            className="pl-2 shadow-none rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="defaultDeliveryTimeMin"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee per kg</FormLabel>
                                    <FormControl>
                                        <NumberInput 
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={1}
                                            className="pl-2 shadow-none rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="defaultDeliveryTimeMax"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Fixed shipping fee</FormLabel>
                                    <FormControl>
                                        <NumberInput 
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={1}
                                            className="pl-2 shadow-none rounded-md"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>

                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="returnPolicy"
                            render={({ field })=><FormItem className="flex-1">
                                <FormLabel>Return policy</FormLabel>
                                <FormControl>
                                    <Textarea className="p-4" placeholder="Name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>}
                        />

                        <Button type="submit" disabled={isLoading} className="cursor-pointer" >
                            {
                                isLoading ? "loading..."
                                : "Save changes"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>;
}

export default StoreDefaultShippingDetails;