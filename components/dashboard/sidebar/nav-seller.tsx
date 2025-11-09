"use client";

// React, Next.js
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation";

//Types
import { DashboardSidebarMenuInterface } from "@/lib/types"

// Constants
import { icons } from "@/constants/icons"

// Ui
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem
} from "@/components/ui/command"

export default function SidebarNavSeller({
    menuLinks
}: {
    menuLinks: DashboardSidebarMenuInterface[]
}) {
    const pathname = usePathname();
    const storeUrlStart = pathname.split("/stores/")[1];
    const activeStore = storeUrlStart.split("/")[0] || "";


    return <nav className="relative grow">
        <Command className="rounded-lg overflow-visible bg-transparent">
            <CommandInput placeholder="Search..." />
            <CommandList className="py-2 overflow-visible">
                <CommandEmpty>
                    No Links Found.
                </CommandEmpty>
                <CommandGroup className="overflow-visible pt-0 relative">
                    {
                        menuLinks.map((link, index) => {
                            let icon;
                            const iconSearch = icons.find((icon) => icon.value===link.icon);
                            if(iconSearch) icon = <iconSearch.path/>
                            return <CommandItem 
                                key={index}
                                className={cn("w-full h-12 cursor-pointer mt-1", {
                                    "bg-accent text-accent-foreground": 
                                    link.link === "" 
                                    ? `/dashboard/seller/stores/${activeStore}` === pathname
                                    : `/dashboard/seller/stores/${activeStore}/${link.link}` === pathname,
                                })}
                            >
                                <Link 
                                    href={`/dashboard/seller/stores/${activeStore}/${link.link}`}
                                    className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all w-full"
                                >
                                    {icon}
                                    <span>{link.label}</span>
                                </Link>
                            </CommandItem>
                        })
                    }
                </CommandGroup>
            </CommandList>
        </Command>
    </nav>
}