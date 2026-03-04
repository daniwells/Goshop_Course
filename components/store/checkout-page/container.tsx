"use client";

import { CartWithCartItemsType, UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@/lib/generated/prisma/client";
import { useEffect, useState } from "react";
import UserShippingAddresses from "../shared/shipping-addresses/shipping-addresses";
import CheckoutProductCard from "../cards/checkout-product";
import PlaceOrderCard from "../cards/place-order";
import { Country as CountryType } from "@/lib/types";
import CountryNote from "../cart-page/country-note";
import { updateCheckoutProductstWithLatest } from "@/queries/user";

interface Props {
    cart: CartWithCartItemsType;
    countries: Country[];
    addresses: UserShippingAddressType[];
    userCountry: CountryType;
}

const CheckoutContainer: React.FC<Props> = ({
    cart,
    countries,
    addresses,
    userCountry
}) => {
    const [ selectedAddress, setSelectedAddress ] = useState<ShippingAddress | null>(null);
    const [cartData, setCartData] = useState<CartWithCartItemsType>(cart);

    const activeCountry = addresses.find((add) => add.countryId === selectedAddress?.countryId)?.country;
    const { cartItems } = cart

    useEffect(() => {
        const hydrateCheckoutCart = async () => {
            const updatedCart = await updateCheckoutProductstWithLatest(cartItems, activeCountry);
            setCartData(updatedCart);
        }

        if(cartItems.length > 0){
            hydrateCheckoutCart();
        }
    }, [activeCountry]);

    return <div className="flex">
        <div className="flex-1 my-3">
            <UserShippingAddresses
                addresses={addresses}
                countries={countries}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
            />
            <div className="my-2">
                <CountryNote
                    country={activeCountry ? activeCountry.name : userCountry.name}
                />
            </div>
            <div className="w-full py-4 px-4 bg-white my-3">
                <div className="relative">
                    {
                        cartData.cartItems.map((product) => (
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
            shippingFees={cartData.shippingFees}
            subTotal={cartData.subTotal}
            total={cartData.total}
        />    
    </div>;
}
 
export default CheckoutContainer;