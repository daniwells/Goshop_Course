import CartContainer from "@/components/store/cart-page/container";
import Header from "@/components/store/layout/header/header";
import { Country } from "@/lib/types";
import { cookies } from "next/headers";

export default async function CartPage() {
    const cookieStore = await cookies();
    const userCountryCookie = cookieStore.get("userCountry");

    let userCountry: Country = {
        name: "United States",
        city: "",
        code: "US",
        region: "",
    }

    if(userCountryCookie){
        userCountry = JSON.parse(userCountryCookie.value) as Country;
    }

    return <div>
        <Header/>
        <CartContainer userCountry={userCountry} />
    </div>
}
