"use client";

import { ShippingAddress, Country } from "@/lib/generated/prisma/client";
import { UserShippingAddressType } from "@/lib/types";
import { Dispatch, SetStateAction, useEffect } from "react";
import ShippingAddressCard from "../../cards/address-card";

interface Props {
    addresses: UserShippingAddressType[];
    countries: Country[];
    selectedAddress: ShippingAddress | null;
    setSelectedAddress: Dispatch<SetStateAction<ShippingAddress | null>>;
}

const AddressList: React.FC<Props> = ({
    addresses,
    countries,
    selectedAddress,
    setSelectedAddress
}) => {
    useEffect(() => {
        const defaultAddresses = addresses.find((address) => address.default);

        if(defaultAddresses) {
            setSelectedAddress(defaultAddresses);
        }
    }, [addresses])

    const handleAddressSelect = (address: ShippingAddress) => {
        setSelectedAddress(address);
    }

    return <div className="space-y-5 max-h-80 overflow-y-auto">
        {
            addresses.map((address) => (
                <ShippingAddressCard
                    key={address.id}
                    address={address}
                    countries={countries}
                    isSelected={selectedAddress?.id === address.id}
                    onSelect = {() => handleAddressSelect(address)}
                    
                />
            ))
        }
    </div>;
}
 
export default AddressList;