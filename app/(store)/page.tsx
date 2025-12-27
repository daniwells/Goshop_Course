// import { UserButton } from "@clerk/nextjs";
// import { seedCountries } from "@/migration-scripts/seed-countries";
import { getProducts } from "@/queries/product";
import ProductList from "@/components/store/shared/product-list";

export default async function HomePage() {
  const productsData = await getProducts();
  const { products } = productsData;

  return (
    <div className="p-14">
      <ProductList products={products} title="Products" arrow/>
    </div>
  );
}
