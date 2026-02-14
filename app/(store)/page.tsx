// import { UserButton } from "@clerk/nextjs";
// import { seedCountries } from "@/migration-scripts/seed-countries";
import { getProducts } from "@/queries/product";
import ProductList from "@/components/store/shared/product-list";
import useFromStore from "@/hooks/useFromStore";
import { useCartStore } from "@/cart-store/userCartStore";
import Header from "@/components/store/layout/header/header";
import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Footer from "@/components/store/layout/footer/footer";

export default async function HomePage() {
  const productsData = await getProducts();
  const { products } = productsData;
  // const cart = useFromStore(useCartStore, (state) => state.cart);
  // const addTocart = useCartStore((state) => state.addToCart);

  return (
    <div className="p-14 pb-96">
      <Header/>
      <CategoriesHeader/>
      <ProductList products={products} title="Products" arrow/>
      <Footer/>
    </div>
  );
}
