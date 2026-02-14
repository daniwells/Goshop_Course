import Image from "next/image";
import CartImg from "@/public/assets/images/cart.avif";
import { Button } from "../ui/button";
import Link from "next/link";

export default function EmptyCart() {
    return <div className="bg-[#f5f5f5] min-h-[calc(100vh-125px)] w-full mx-auto px-4 text-center">
        <div className="h-full min-h-[calc(100vh-65px)] pb-14 flex flex-col justify-center items-center">
            <Image
                src={CartImg}
                alt="Cart image"
                width={300}
                height={300}
                className="w-64 h-54"
            />
            <span className="py-4 font-bold my-3">
                No items yet? Continue shopping to explore more.
            </span>
            <Link href="/browse">
                <Button variant="pink" className="w-56">
                    Explore items
                </Button>
            </Link>
        </div>
    </div>;
}
