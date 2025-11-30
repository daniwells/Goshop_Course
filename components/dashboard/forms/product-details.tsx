"use client";

// React, Next.js
import { FC, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

// Utils
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";
import { toast } from "sonner";

// Other libs components
import { WithOutContext as ReactTags } from "react-tag-input";
import { NumberInput } from "@tremor/react";

// React datetime picker
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { format } from "date-fns";

// Custom components
import ImageUpload from "../shared/image-upload";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";

// Ui
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Prisma
import { Category, SubCategory, OfferTag } from "@/lib/generated/prisma/client";

// Lib
import { Button } from "@/components/ui/button";
import { ProductFormSchema } from "@/lib/schemas";

// Query
import { getAllSubCategoriesForCategory } from "@/queries/category";
import { upsertProduct } from "@/queries/product";

// Types
import { ProductWithVariantType } from "@/lib/types";

// Jodit text editor
import JoditEditor from "jodit-react";

interface ProductDetailsProps {
    data?: Partial<ProductWithVariantType>;
    categories: Category[];
    storeUrl: string;
    offerTags?: OfferTag[];
}

const ProductDetails: FC<ProductDetailsProps> = ({ 
    data,
    categories,
    storeUrl,
    offerTags,
}) => {
    const router = useRouter();

    const productDescEditor = useRef(null);
    const variantDescEditor = useRef(null);

    const [subCategories, setSubcategories] = useState<SubCategory[]>([]);
    const [colors, setColors] = useState<{ color: string }[]>([{color: ""}]);
    const [sizes, setSizes] = useState<{ size: string, price: number, quantity: number, discount: number }[]>(
        [{size: "", quantity: 1, price: 0.01, discount: 0}]
    );
    const [ productSpecs, setProductSpecs ] = useState<{ name: string; value: string }[]>(
        data?.product_specs || [{ name: "", value: "" }]
    );
    const [ variantSpecs, setVariantSpecs ] = useState<{ name: string; value: string }[]>(
        data?.variant_specs || [{ name: "", value: "" }]
    );
    const [ questions, setQuestions ] = useState<{ question: string; answer: string }[]>(
        data?.questions || [{ question: "", answer: "" }]
    );

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
            variantImage: data?.variantImage ? [{ url: data.variantImage }] : [],
            categoryId: data?.categoryId,
            subCategoryId: data?.subCategoryId,
            brand: data?.brand,
            sku: data?.sku,
            colors: data?.colors || [{ color: "" }],
            sizes: data?.sizes,
            keywords: data?.keywords,
            isSale: data?.isSale,
            saleEndDate: data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
            product_specs: data?.product_specs,
            variant_specs: data?.variant_specs,
            questions: data?.questions,
            offerTagId: data?.offerTagId,
        },
    });

    useEffect(() => {
        const getSubCategories = async () => {
            const res = await getAllSubCategoriesForCategory(form.watch().categoryId);
            setSubcategories(res);
        };

        getSubCategories();
    }, [form.watch().categoryId])

    const errors = form.formState.errors;

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if(data){
            form.reset({...data, variantImage: [{ url: data.variantImage }]});
        }
    }, [data, form]);
    
    const handleSubmit = async () => {
        const values = form.getValues();

        try {
            const response = await upsertProduct({
                    productId: data?.productId ? data.productId : v4(),
                    variantId: data?.variantId ? data.variantId : v4(),
                    name: values.name,
                    description: values.description,
                    variantName: values.variantName,
                    variantDescription: values.variantDescription || "",
                    images: values.images,
                    variantImage: values.variantImage[0].url,
                    categoryId: values.categoryId,
                    subCategoryId: values.subCategoryId,
                    isSale: values.isSale,
                    saleEndDate: values.saleEndDate,
                    brand: values.brand,
                    sku: values.sku,
                    colors: values.colors,
                    sizes: values.sizes,
                    keywords: values.keywords,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    variant_specs: values.variant_specs,
                    product_specs: values.product_specs,
                    questions: values.questions,
                    offerTagId: values.offerTagId || "",
                },
                storeUrl
            );

            toast.success(
                data?.productId && data?.variantId 
                ? "Product has been updated."
                : `Congratulations! Product '${response?.slug}' is now created.`
            );

            if(data?.productId && data.variantId){
                router.refresh();
            }
            router.push(`/dashboard/seller/stores/${storeUrl}/products`);
        } catch (error) {
            console.log(error);
            toast.error("Oops!", {
                description: error?.toString(),
            });
        }
    };

    const [keywords, setKeywords] = useState<string[]>([]);
    
    interface Keyword {
        id: string;
        text: string;
    };

    const handleAddition = (keyword: Keyword)=>{
        if(keywords.length === 10) return;
        setKeywords([...keywords, keyword.text]);
    };

    const handleDeleteKeyword = (i:number) => {
        setKeywords(keywords.filter((_, index) => index !== i));
    };

    useEffect(() => {
        form.setValue("colors", colors);
        form.setValue("sizes", sizes);
        form.setValue("keywords", keywords);
        form.setValue("product_specs", productSpecs);
        form.setValue("variant_specs", productSpecs);
    }, [colors, sizes, keywords, productSpecs, variantSpecs, data]);

    return <AlertDialog>
        <Card className="w-full" >
            <CardHeader>
                <CardTitle>New Product</CardTitle>
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
                        {/* Images - colors */}
                        <div className="flex flex-col gap-y-6 xl:flex-row">
                            {/* Images */}
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
                                                    colors={colors}
                                                    setColors={setColors}
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
                            {/* Colors */}
                            <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                                <ClickToAddInputs
                                    details={data?.colors || colors}
                                    // @ts-ignore
                                    setDetails={setColors}
                                    initialDetail={{ color: "" }}
                                    header="Colors"
                                    colorPicker
                                />
                                {errors.colors && (
                                    <span className="text-sm font-medium text-destructive">
                                        {errors.colors.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Name - variant name */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="name"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="variantName"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Variant Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Variant name" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>}
                            />
                        </div>
                        
                        {/* Description - variant description */}
                        <Tabs defaultValue="product" className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="product">Product description</TabsTrigger>
                                <TabsTrigger value="variant">Variant description</TabsTrigger>
                            </TabsList>
                            <TabsContent value="product">
                                <FormField 
                                    disabled={isLoading}
                                    control={form.control}
                                    name="description"
                                    render={({ field })=><FormItem className="flex-1">
                                        <FormControl>
                                            <JoditEditor
                                                ref={productDescEditor}
                                                value={form.getValues().description}
                                                onChange={(content) => {
                                                    form.setValue("description", content);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>}
                                />
                            </TabsContent>
                            <TabsContent value="variant">
                                <FormField 
                                    disabled={isLoading}
                                    control={form.control}
                                    name="variantDescription"
                                    render={({ field })=><FormItem className="flex-1">
                                        <FormControl>
                                            <JoditEditor
                                                ref={variantDescEditor}
                                                value={form.getValues().variantDescription || ""}
                                                onChange={(content) => {
                                                    form.setValue("variantDescription", content);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>}
                                />
                            </TabsContent>
                        </Tabs>
                
                        {/* <div className="flex flex-col lg:flex-row gap-4 hidden"> */}
                            {/* Description */}
                            
                            {/* VariantDescription */}                            
                        {/* </div> */}
                        
                        {/* Category - subCategory - offerTags */}
                        <div className="flex gap-4">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="categoryId"
                                render={({ field })=><FormItem className="flex-1">
                                    <FormLabel>Product Category</FormLabel>
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
                                </FormItem>}
                            />
                            {
                                form.watch().categoryId && (
                                    <FormField 
                                        disabled={isLoading}
                                        control={form.control}
                                        name="subCategoryId"
                                        render={({ field })=><FormItem className="flex-1">
                                            <FormLabel>Product SubCategory</FormLabel>
                                            <Select 
                                                disabled={isLoading || subCategories.length == 0}
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
                                                        subCategories.map((subCategory) => (
                                                            <SelectItem 
                                                                key={subCategory.id}
                                                                value={subCategory.id}
                                                            >
                                                                {subCategory.name}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </FormItem>}
                                    />
                                )
                            }
                            {/* Offer Tag */}
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="offerTagId"
                                render={({ field }) => (
                                <FormItem className="flex-1">
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
                                            placeholder="Select an offer"
                                        />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {offerTags &&
                                        offerTags.map((offer) => (
                                            <SelectItem key={offer.id} value={offer.id}>
                                            {offer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        {/* Brand, Sku */}
                        <div className="flex flex-col lg:flex-row gap-4">
                                <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Product brand" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Product sku" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                        <NumberInput
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Product weight"
                                            min={0.01}
                                            step={0.01}
                                            className="!shadow-none rounded-md !text-sm px-3"
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Variant image - Keywords */}
                        <div className="flex items-center gap-10 py-14">
                            {/* Variant image */}
                            <div className="border-r pr-10">
                                <FormField
                                    control={form.control}
                                    name="variantImage"
                                    render={({ field })=>(
                                        <FormItem>
                                            <FormLabel className="ml-14">Variant Image</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    dontShowPreview
                                                    type="profile"
                                                    value={field.value.map((image) => image.url)}
                                                    disabled={isLoading}
                                                    onChange={(url) => field.onChange([{ url }])}
                                                    onRemove={(url) =>
                                                        field.onChange([
                                                            ...field.value.filter(
                                                            (current) => current.url !== url
                                                            ),
                                                        ])
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage className="!mt-4" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Keywords */}
                            <div className="w-full flex-1 space-y-3" >
                                <FormField 
                                    control={form.control}
                                    name="keywords"
                                    render={ ({field}) => (
                                        <FormItem className="relative flex-1">
                                            <FormLabel>Product keywords</FormLabel>
                                            <FormControl>
                                                <ReactTags
                                                    // @ts-ignore
                                                    handleAddition={handleAddition}
                                                    handleDelete={() => {}}
                                                    placeholder="Keywords (e.g., winter jacket, warm, stylish)"
                                                    classNames={{
                                                        tagInputField: "bg-background border rounded-md p-2 w-full focus:outline-none",
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex flex-wrap gap-1">
                                    {
                                        keywords.map((keyword,index) => (
                                            <div 
                                                key={index} 
                                                className="text-xs inline-flex items-center px-3 py-1 bg-blue-200 text-blue-700 rounded-full gap-x-2"
                                            >
                                                <span>{keyword}</span>
                                                <span 
                                                    className="cursor-pointer" 
                                                    onClick={() => handleDeleteKeyword(index)}
                                                >

                                                </span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        
                        {/* Sizes */}
                        <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                            <ClickToAddInputs
                                details={sizes}
                                // @ts-ignore
                                setDetails={setSizes}
                                initialDetail={{size: "", quantity: 1, price: 0.01, discount: 0}}
                                header="Sizes, Quantities, Prices, Discounts"
                            />
                            {errors.sizes && (
                                <span className="text-sm font-medium text-destructive">
                                    {errors.sizes.message}
                                </span>
                            )}
                        </div>
                        
                        {/*  Questions */}
                        <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                            <ClickToAddInputs
                                details={questions}
                                // @ts-ignore
                                setDetails={setQuestions}
                                initialDetail={{question: "", answer: "",}}
                                header="Questions & Answers"
                            />
                            {errors.sizes && (
                                <span className="text-sm font-medium text-destructive">
                                    {errors.sizes.message}
                                </span>
                            )}
                        </div>
                        
                        {/* Product and variant specs */}
                        <Tabs defaultValue="productSpecs" className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="productSpecs">Product specifications</TabsTrigger>
                                <TabsTrigger value="variantSpecs">Variant specifications</TabsTrigger>
                            </TabsList>
                            <TabsContent value="productSpecs">
                                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                                    <ClickToAddInputs
                                        details={productSpecs}
                                        // @ts-ignore
                                        setDetails={setProductSpecs}
                                        initialDetail={{name: "", value: ""}}
                                    />
                                    {errors.product_specs && (
                                        <span className="text-sm font-medium text-destructive">
                                            {errors.product_specs.message}
                                        </span>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="variantSpecs">
                                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                                    <ClickToAddInputs
                                        details={variantSpecs}
                                        // @ts-ignore
                                        setDetails={setVariantSpecs}
                                        initialDetail={{name: "", value: ""}}
                                    />
                                    {errors.variant_specs && (
                                        <span className="text-sm font-medium text-destructive">
                                            {errors.variant_specs.message}
                                        </span>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                        
                        {/* Is On Sale */}
                        <div className="flex border rounded-md">
                            <FormField 
                                disabled={isLoading}
                                control={form.control}
                                name="isSale"
                                render={({ field })=>(
                                    <FormItem className="flex flex-row items-start space-x-3 p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>On Sale</FormLabel>
                                            <FormDescription>
                                                Is this product on sale?
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {
                                form.getValues().isSale && (
                                    <FormField
                                        disabled={isLoading}
                                        control={form.control}
                                        name="saleEndDate"
                                        render={({ field })=>(
                                            <FormItem className="flex flex-row items-start space-x-3 p-4">
                                                <FormControl>
                                                    <DateTimePicker
                                                        onChange={(date) => {
                                                            field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "");
                                                        }}
                                                        value={field.value ? new Date(field.value) : null}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )
                            }
                        </div>
                
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
    </AlertDialog>
}

export default ProductDetails;