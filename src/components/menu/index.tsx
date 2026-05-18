import { ProductWithRelations } from "@/types/Product";
import MenuItem from "./MenuItem";

/**
 * Renders a responsive grid of menu cards.
 * @param {ProductWithRelations[]} items - Products to display.
 */
function Menu({ items }: { items: ProductWithRelations[] }) {
  return (
    <ul className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: ProductWithRelations) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

export default Menu;
