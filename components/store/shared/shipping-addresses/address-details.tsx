"use client";

// React, Next.js
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Prisma model
import { Country } from "@/lib/generated/prisma/client";

// Form handling utilities
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Types, Schema
import { ShippingAddressSchema } from "@/lib/schemas";
import { SelectMenuOption, UserShippingAddressType } from "@/lib/types";

// UI Components
import CountrySelector from "@/components/shared/country-selector";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../../ui/button";

// Queries
import { upsertShippingAddress } from "@/queries/user";

// Utils
import { v4 } from "uuid";

// Toast
import { toast } from "sonner";

interface AddressDetailsProps {
    data?: UserShippingAddressType;
    countries: Country[];
    setShow: Dispatch<SetStateAction<boolean>>;
}

const AddressDetails: FC<AddressDetailsProps> = ({
    data,
    countries,
    setShow,
}) => {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [country, setCountry] = useState<string>("Brazil");

    const form = useForm<z.infer<typeof ShippingAddressSchema>>({
        mode: "onChange",
        resolver: zodResolver(ShippingAddressSchema),
        defaultValues: {
            firstName: data?.firstName,
            lastName: data?.lastName,
            address1: data?.address1,
            address2: data?.address2 || "",
            city: data?.city,
            countryId: data?.countryId,
            phone: data?.phone,
            state: data?.state,
            zip_code: data?.zip_code,
            default: data?.default,
        }
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if (data) {
            form.reset({
                ...data,
                address2: data.address2 || "",
            });
            handleCountryChange(data?.country.name);
        }
    }, [data, form]);

    const handleSubmit = async (
        values: z.infer<typeof ShippingAddressSchema>
    ) => {
        try {
            await upsertShippingAddress({
                id: data?.id ? data.id : v4(),
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                address1: values.address1,
                address2: values.address2 || "",
                city: values.city,
                countryId: values.countryId,
                state: values.state,
                default: values.default,
                zip_code: values.zip_code,
                userId: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            toast.success(
                data?.id
                ? "Shipping address has been updated."
                : `Congratulations! Shipping address is now created.`,
            );
    
            router.refresh();
            setShow(false);
        } catch (error: any) {
            toast.error("Oops!", {
                description: error.toString(),
            });
        }
    };

    const handleCountryChange = (name: string) => {
    const country = countries.find((c) => c.name === name);
        if (country) {
            form.setValue("countryId", country.id);
        }
        setCountry(name);
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <FormLabel>Contact information</FormLabel>
                        <div className="flex items-center justify-between gap-3">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="First name*" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Last name*" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                            <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                                <FormControl>
                                <Input placeholder="Phone number*" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <FormLabel>Address</FormLabel>
                        <div>
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="countryId"
                            render={({ field }) => (
                                <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                                <FormControl>
                                    <CountrySelector
                                    id={"countries"}
                                    open={isOpen}
                                    onToggle={() => setIsOpen((prev) => !prev)}
                                    onChange={(val) => handleCountryChange(val)}
                                    selectedValue={
                                        (countries.find(
                                        (c) => c.name === country
                                        ) as SelectMenuOption) || countries[0]
                                    }
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        </div>
                        <div className="!mt-3 flex items-center justify-between gap-3">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="address1"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            placeholder="Street, house/apartment/unit*"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="address2"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            placeholder="Apt, suite, unit, etc (optional）"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="!mt-3 flex items-center justify-between gap-3">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="State*" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="City*" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="zip_code"
                            render={({ field }) => (
                            <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                                <FormControl>
                                    <Input placeholder="Zip code*" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="rounded-md">
                        {isLoading
                            ? "loading..."
                            : data?.id
                            ? "Save address information"
                            : "Create address"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddressDetails;