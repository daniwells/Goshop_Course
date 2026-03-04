import { ShippingAddress } from "@/lib/generated/prisma/client";
import { Button } from "../ui/button";
import FastDelivery from "./fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import toast from "react-hot-toast";
import { emptyUserCart, placeOrder } from "@/queries/user";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/cart-store/userCartStore";
import { cn } from "@/lib/utils/utils-client";

interface Props {
    shippingFees: number;
    subTotal: number;
    total: number;
    shippingAddress: ShippingAddress | null;
    cartId: string;
}

const PlaceOrderCard: React.FC<Props> = ({
    shippingFees,
    subTotal,
    total,
    shippingAddress,
    cartId
}) => {
    const { push } = useRouter()

    const emptyCart = useCartStore((state) => state.emptyCart);

    const handlePlaceOrder = async () => {
        if(!shippingAddress){
            toast.error("Select a shipping address first!");
        }else{
            const order = await placeOrder(shippingAddress, cartId);
            if(order) {
                emptyCart();
                await emptyUserCart();
                push(`/order/${order.orderId}`);
            }
        }
    }

    return <div className="sticky top-4 mt-3 ml-5 w-[380px] max-h-max">
        <div className="relative py-4 px-6 bg-white">
            <h1 className="text-gray-900 text-2xl font-bold mb-4">
                Summary
            </h1>
            <Info title="Subtotal" text={`${subTotal.toFixed(2)}`}/>
            <Info title="Shipping Fees" text={`+${subTotal.toFixed(2)}`}/>
            <Info title="Taxes" text={`+0.00`}/>
            <Info title="Total" text={`+${total.toFixed(2)}`} isBold noBorder/>
        </div>
        <div className="pt-2.5">
            <Button onClick={() => handlePlaceOrder()} >
                <span>Place order</span>
            </Button>
        </div>
        <div className="mt-2 p-4 bg-white px-6">
            <FastDelivery/>
        </div>
        <div className="mt-2 p-4 bg-white px-6">
            <SecurityPrivacyCard/>
        </div>
    </div>;
}
 
export default PlaceOrderCard;

const Info = ({
    title,
    text,
    isBold,
    noBorder
}: { 
    title: string;
    text: string;
    isBold?: boolean;
    noBorder?: boolean
}) => {

    return <div className={cn("mt-4 font-medium flex items-center text-[#222] text-sm pb-1 border-b", {
        "font-bold": isBold,
        "border-b-0": noBorder
    })}>
        <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            {title}
        </h2>
        <h3 className="flex-1 w-0 min-w-0 text-right">
            <span className="px-0.5 text-2xl text-black">
                <div className="text-black text-xl inline-block break-all">
                    {text}
                </div>
            </span>
        </h3>
    </div>
}