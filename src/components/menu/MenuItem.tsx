import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { ProductWithRelations } from "@/types/Product";

/**
 * Displays a single product card in the menu grid.
 * Includes product image, starting price, description, and add-to-cart action.
 * @param {ProductWithRelations} item - Product to render.
 */
const MenuItem = ({ item }: { item: ProductWithRelations }) => {
  const basePrice = Number(item.basePrice || 0);
  const minSizePrice = item.sizes.length
    ? Math.min(...item.sizes.map((size) => Number(size.price || 0)))
    : 0;
  const startingPrice = basePrice + minSizePrice;

  return (
    <li className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="relative w-full h-56 mx-auto mb-4 border border-border rounded-lg overflow-hidden">
        <Image
          src={item.image}
          alt={item.description}
          fill
          className="object-contain"
        />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-xl">{item.name}</h4>
        <strong className="text-accent">
          From {formatCurrency(startingPrice)}
        </strong>
      </div>
      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
        {item.description}
      </p>
      <AddToCartButton item={item} />
    </li>
  );
};

export default MenuItem;
