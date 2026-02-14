"use client";

import { CartWithCartItemsType, UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@/lib/generated/prisma/client";
import { useState } from "react";
import UserShippingAddresses from "../shared/shipping-addresses/shipping-addresses";
import CheckoutProductCard from "../cards/checkout-product";
import PlaceOrderCard from "../cards/place-order";

interface Props {
    cart: CartWithCartItemsType;
    countries: Country[];
    addresses: UserShippingAddressType[];
}

const CheckoutContainer: React.FC<Props> = ({
    cart,
    countries,
    addresses,
}) => {
    const [ selectedAddress, setSelectedAddress ] = useState<ShippingAddress | null>(null);

    return <div className="flex">
        <div className="flex-1 my-3">
            <UserShippingAddresses
                addresses={addresses}
                countries={countries}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
            />
            <div className="w-full py-4 px-4 bg-white my-3">
                <div className="relative">
                    {
                        cart.cartItems.map((product) => (
                            <CheckoutProductCard
                                key={product.variantId}
                                product={product}
                                isDiscounted={false}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
        <PlaceOrderCard
            cartId={cart.id}
            shippingAddress={selectedAddress}
            shippingFees={cart.shippingFees}
            subTotal={cart.subTotal}
            total={cart.total}
        />    
    </div>;
}
 
export default CheckoutContainer;