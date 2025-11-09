// React, Next.js
import { FC } from "react";

// Custom components
import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";
import SidebarNavSeller from "./nav-seller";
import Logo from "@/components/shared/logo";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Prisma models
import { Store } from "@/lib/generated/prisma/client";

// Constants
import { adminDashboardSidebarOptions, sellerDashboardSidebarOptions } from "@/constants/data";


interface SidebarProps{
    isAdmin?: boolean;
    stores?: Store[];
}

const Sidebar: FC<SidebarProps> = async ({isAdmin}) => {
    const user = await currentUser();
    
    return <div className="w-[300px] border-r h-screen px-4 flex flex-col fixed top-0 left-0 bottom-0">
        <Logo width="100%" height="120px"/>
        { user && <UserInfo user={user} /> }
        { 
            isAdmin ? 
                <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} /> 
            : 
                <SidebarNavSeller menuLinks={sellerDashboardSidebarOptions} /> 
        }
    </div>
}

export default Sidebar;