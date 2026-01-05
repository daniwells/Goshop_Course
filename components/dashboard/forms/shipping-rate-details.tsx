"use client";

// Libs
import { FC, useEffect } from "react"
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";

// Components
import { NumberInput } from "@tremor/react";

// Shadcn
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Lib
import { Button } from "@/components/ui/button";

// Query
import { upsertCategory } from "@/queries/category";

// Types
import { CountryWithShippingRatesType } from "@/lib/types";

// Schemas
import { ShippingRateFormSchema } from "@/lib/schemas";
import { upsertShippingRate } from "@/queries/store";

interface ShippingRateDetailsProps {
    data?: CountryWithShippingRatesType;
    storeUrl: string;
}

const ShippingRateDetails: FC<ShippingRateDetailsProps> = ({ data, storeUrl }) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof ShippingRateFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(ShippingRateFormSchema),
        defaultValues: {
            countryId: data?.countryId,
            countryName: data?.countryName,
            shippingService: data?.shippingRate ? data?.shippingRate.shippingService : "",
            shippingFeePerItem: data?.shippingRate ? data?.shippingRate.shippingFeePerItem : 0,
            shippingFeeForAdditionalItem: data?.shippingRate ? data?.shippingRate.shippingFeeForAdditionalItem : 0,
            shippingFeePerKg: data?.shippingRate ? data?.shippingRate.shippingFeePerKg : 0,
            shippingFeeFixed: data?.shippingRate ? data?.shippingRate.shippingFeeFixed : 0,
            deliveryTimeMin: data?.shippingRate ? data?.shippingRate.deliveryTimeMin : 1,
            deliveryTimeMax: data?.shippingRate ? data?.shippingRate.deliveryTimeMax : 1,
            returnPolicy: data?.shippingRate ? data.shippingRate.returnPolicy : "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if(data)
            form.reset(data);
        
    }, [data, form])
    
    const handleSubmit = async () => {

        const values = form.getValues();

        try {
            const response = await upsertShippingRate(storeUrl, {        
                id: data?.shippingRate ? data.shippingRate.id : v4(),
                countryId: data?.countryId ? data.countryId : "",
                shippingService: values.shippingService,
                shippingFeePerItem: values.shippingFeePerItem,
                shippingFeeForAdditionalItem: values.shippingFeeForAdditionalItem,
                shippingFeePerKg: values.shippingFeePerKg,
                shippingFeeFixed: values.shippingFeeFixed,
                deliveryTimeMin: values.deliveryTimeMin,
                deliveryTimeMax: values.deliveryTimeMax,
                returnPolicy: values.returnPolicy,
                storeId: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (response.id) {
                toast.success("Shipping rates updated sucessfully !");
                router.refresh();
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
                <CardTitle>Category Information</CardTitle>
                <CardDescription>Update shipping rate information for {data?.countryName}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 "
                    >
                        <div className="hidden">
                            <FormField
                                disabled
                                control={form.control}
                                name="countryId"
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
                                name="shippingService"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Shipping service" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>
                        <div className="space-y-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="shippingFeePerItem"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee per item</FormLabel>
                                    <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            step={0.1}
                                            min={1}
                                            className="pl-1 shadow-none rounded-md"
                                            placeholder="Shipping fee per item"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="shippingFeeForAdditionalItem"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee for additional item</FormLabel>
                                    <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            step={0.1}
                                            min={0}
                                            className="pl-1 shadow-none rounded-md"
                                            placeholder="Shipping fee for additional item"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="shippingFeePerKg"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Shipping fee for additional item</FormLabel>
                                    <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            step={0.1}
                                            min={0}
                                            className="pl-1 shadow-none rounded-md"
                                            placeholder="Shipping fee per kg"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="shippingFeeFixed"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Fixed shipping fee</FormLabel>
                                    <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            step={0.1}
                                            min={0}
                                            className="pl-1 shadow-none rounded-md"
                                            placeholder="Fixed shipping fee"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="deliveryTimeMin"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Delivery time min</FormLabel>
                                    <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={1}
                                            className="pl-1 shadow-none rounded-md"
                                            placeholder="Minimum delivery time (days)"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="deliveryTimeMax"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Delivery time max</FormLabel>
                                    <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            min={1}
                                            className="pl-1 shadow-none rounded-md"
                                            placeholder="Maximum delivery time (days)"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="returnPolicy"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Return policy</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="What's the return policy for your store?"
                                            className="p-4"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>
                        
                        <Button type="submit" disabled={isLoading} className="cursor-pointer" >
                            {
                                isLoading ? "loading..." : "Save changes"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </AlertDialog>;
}

export default ShippingRateDetails;