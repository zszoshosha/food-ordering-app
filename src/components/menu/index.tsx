/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductWithRelations } from "@/types/Product";
import MenuItem from "./MenuItem";

/**
 * Menu component renders a grid of menu items.
 * @param {Array} items - Array of menu item objects to display.
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
