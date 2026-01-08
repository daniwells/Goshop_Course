import { useCartStore } from "@/cart-store/userCartStore";
import useFromStore from "@/hooks/useFromStore";
import { Size } from "@/lib/generated/prisma/client";
import { CartProductType } from "@/lib/types";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";

interface Props {
    productId: string;
    variantId: string;
    sizeId: string | null;
    quantity: number;
    stock: number;
    handleChange: (property: keyof CartProductType, value: any) => void;
    sizes: Size[];
}

const QuantitySelector: React.FC<Props> = ({
    productId,
    variantId,
    sizeId,
    quantity,
    stock,
    handleChange,
    sizes,
}) => {
    if(!sizeId) return null;

    const cart = useFromStore(useCartStore, (state) => state.cart);

    useEffect(() => {
        handleChange("quantity", 1);
    }, [sizeId]);

    const maxQty = useMemo(() => {
        const search_product = cart?.find((p) => 
            p.productId === productId &&
            p.variantId === variantId &&
            p.sizeId === sizeId
        );

        return search_product ? search_product.stock - search_product.quantity : stock;
    }, [cart, productId, variantId, sizeId, stock]);

    const handleIncrease = () => {
        if(quantity < maxQty){
            handleChange("quantity", quantity + 1);
        }
    }

    const handleDecrease = () => {
        if(quantity > 1){
            handleChange("quantity", quantity - 1);
        }
    }

    return <div className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg" >
        <div className="w-full flex justify-between items-center gap-x-5">
            <div className="grow">
                <span className="block text-xs text-gray-500">
                    Select quantity
                </span>
                <span className="clock text-xs text-gray-500">
                    {
                        maxQty !== stock && `(You already have ${stock - maxQty} pieces of this product in cart)`
                    }
                </span>
                <input
                    type="number"
                    className="w-full p-0 bg-transparent border-0 focus:outline-0 text-gray-800"
                    min={1}
                    value={maxQty <= 0 ? 0 : quantity}
                    max={maxQty}
                    readOnly
                />
            </div>
            <div className="flex justify-end items-center gap-x-1 5">
                <button
                    onClick={handleDecrease}
                    className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={ quantity === 1 }
                >
                    <Minus className="w-3" />
                </button>
                <button
                    onClick={handleIncrease}
                    className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={quantity === stock}
                >
                    <Plus className="w-3" />
                </button>
            </div>
        </div>
    </div>;
}
 
export default QuantitySelector;