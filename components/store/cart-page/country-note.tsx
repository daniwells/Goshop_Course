import { Country } from '@/lib/types'
import { Info } from 'lucide-react'
import React from 'react'

export default function CountryNote({country}: { country: string }) {
    return <div className="w-full p-3 bg-green-300 flex items-center">
        <div className="w-8 h-8 border rounded-full border-green-200 flex shrink-0 items-center justify-center" >
            <Info className="stroke-green-300 " />
        </div>
        <div className="pl-3 w-full">
            <div className="flex items-center justify-between">
                <p className="text-sm leading-none text-green-700">
                    Shipping fees are calculated based on your current country (
                        {country}). <br/>
                    shipping fees will always automatically update to reflect your
                    delivery destination.
                </p>
            </div>
        </div>
    </div>
}
