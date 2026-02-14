import { ShippingAddress } from "@/lib/generated/prisma/client";
import { Button } from "../ui/button";
import FastDelivery from "./fast-delivery";
import { SecurityPrivacyCard } from "../product-page/returns-security-privacy-card";
import toast from "react-hot-toast";
import { emptyUserCart, placeOrder } from "@/queries/user";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/cart-store/userCartStore";

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
            <div className="mt-4 font-medium flex items-center text-[#222] text-sm">
                <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
                    Subtotal
                </h2>
                <h3 className="flex-1 w-0 min-w-0 text-right">
                    <span className="px-0.5 text-2xl text-black">
                        <div className="text-black text-xl inline-block break-all">
                            ${subTotal.toFixed(2)}
                        </div>
                    </span>
                </h3>
            </div>
            <div className="mt-4 font-medium flex items-center text-[#222] text-sm">
                <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
                    Shipping fees
                </h2>
                <h3 className="flex-1 w-0 min-w-0 text-right">
                    <span className="px-0.5 text-2xl text-black">
                        <div className="text-black text-xl inline-block break-all">
                            ${shippingFees.toFixed(2)}
                        </div>
                    </span>
                </h3>
            </div>
            <div className="mt-4 font-medium flex items-center text-[#222] text-sm">
                <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
                    Total
                </h2>
                <h3 className="flex-1 w-0 min-w-0 text-right">
                    <span className="px-0.5 text-2xl text-black">
                        <div className="text-black text-xl inline-block break-all">
                            ${total.toFixed(2)}
                        </div>
                    </span>
                </h3>
            </div>
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