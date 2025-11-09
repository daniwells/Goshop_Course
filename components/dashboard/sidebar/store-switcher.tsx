"use client";

import { FC, useState } from "react";
import { PopoverTrigger, Popover, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, PlusCircle, StoreIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useRouter, useParams } from "next/navigation";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
    typeof PopoverTrigger
>;

interface StoreSwitcherProps extends PopoverTriggerProps {
    stores: Record<string, any>[];
}

const StoreSwitcher: FC<StoreSwitcherProps> = ({ stores, className }) => {
    const [open, setOpen] = useState(false);

    const params = useParams();
    const router = useRouter();

    const formattedItems = stores.map((store) => ({
        label: store.name,
        value: store.url,
    }));

    const activeStore = formattedItems.find((store) => store.value === params.storeUrl);

    const onStoreSelect = (store: {label: string, value: string}) => {
        setOpen(false);
        router.push(`/dashboard/seller/stores/${store.value}`);
    }

    return <Popover 
        open={open}
        onOpenChange={setOpen}
    >
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                size="sm"
                role="combobox"
                aria-expanded={open}
                aria-label="Select a store"
                className={cn("w-[250px] justify-between", className)}
            >
                <StoreIcon className="mr-2 w-4 h-4"/>
                {activeStore?.label}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50"/>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" >
            <Command>
                <CommandList>
                    <CommandInput placeholder="Search stores..." />
                    <CommandEmpty>No Store Selected.</CommandEmpty> 
                    <CommandGroup heading="Stores">
                        {
                            formattedItems.map((store) => (
                                <CommandItem
                                    key={store.value}
                                    onSelect={() => onStoreSelect(store)}
                                    className="text-sm cursor-pointer"
                                >
                                    <StoreIcon className="mr-2 w-4 h-4"/>
                                    {store.label}
                                    <Check
                                        className={cn("ml-auto h-4 w-4 opacity-0 ", {
                                           "opacity-100": activeStore?.value === store.value
                                        })}
                                    />
                                </CommandItem>
                            ))
                        }
                    </CommandGroup>
                </CommandList>
                <CommandSeparator/>
                <CommandList>
                    <CommandItem
                        className="cursor-pointer"
                        onSelect={() => {
                            setOpen(false);
                            router.push(`/dashboard/seller/stores/new`);
                        }} 
                    >
                        <PlusCircle className="mr-2 h-5 w-5"/> Create Store
                    </CommandItem>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>;
}

export default StoreSwitcher;