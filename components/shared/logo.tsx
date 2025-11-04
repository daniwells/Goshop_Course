// Libs
import { FC } from "react";
import Image from "next/image";

// Images
import LogoImg from "@/public/assets/icons/logo-full.png";

interface LogoProps{
    width: string;
    height: string;
}

const Logo: FC<LogoProps> = ({ width, height }) => {
    return <div className="z-50 py-4" style={{width, height}}>
        <Image
            src={LogoImg}
            alt="GoShop Logo"
            className="w-full h-full object-cover overflow-visible"
        />
    </div>
}

export default Logo;