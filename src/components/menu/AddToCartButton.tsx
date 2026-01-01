/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Sample size options for menu items.
 */
const sizes = [
  { id: crypto.randomUUID(), name: "small", price: 0 },
  { id: crypto.randomUUID(), name: "medium", price: 4 },
  { id: crypto.randomUUID(), name: "large", price: 8 },
];

/**
 * Sample extra options for menu items.
 */
const extras = [
  { id: crypto.randomUUID(), name: "chesse", price: 0 },
  { id: crypto.randomUUID(), name: "onion", price: 4 },
  { id: crypto.randomUUID(), name: "tomato", price: 8 },
];

/**
 * AddToCartButton component opens a dialog for customizing and adding an item to the cart.
 * Allows selection of size and extras, displays item details.
 * @param {Object} item - The menu item object.
 */
const AddToCartButton = ({ item }: { item: any }) => {
  return (
    <Dialog>
      <>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="lg"
            className=" mt-4 text-white rounded-full !px-8"
          >
            add to cart
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex items-center">
            <Image
              src={item.image}
              alt={item.description}
              width={200}
              height={200}
            />
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{item.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-10">
            <div className="space-y-4 text-center">
              <Label htmlFor="pick-size">pick your size</Label>
              <PickSize sizes={sizes} item={item} />
            </div>
            <div className="space-y-4 text-center">
              <Label htmlFor="add-extras">Any Extra ?</Label>
              <Extras extras={extras} item={undefined} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </>
    </Dialog>
  );
};

export default AddToCartButton;

/**
 * PickSize component renders radio buttons for selecting item size.
 * @param {Array} sizes - Array of size options.
 * @param {Object} item - The menu item for price calculation.
 */
function PickSize({ sizes, item }: { sizes: any; item: any }) {
  return (
    <RadioGroup defaultValue="comfortable">
      {sizes.map((size: any) => (
        <div
          key={size.id}
          className="flex items-center space-x-2 border border-border rounded-lg p-4 bg-card hover:bg-accent transition-colors"
        >
          <RadioGroupItem value={size.id} id={size.id} />
          <Label htmlFor={size.id}>
            {size.name} {formatCurrency(size.price + item.basePrice)}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

/**
 * Extras component renders checkboxes for selecting extra toppings.
 * @param {Array} extras - Array of extra options.
 * @param {Object} item - The menu item (unused in this component).
 */
function Extras({ extras, item }: { extras: any; item: any }) {
  return extras.map((extra:any) => (
    <div
      key={extra.id}
      className="flex items-center space-x-2 border border-border rounded-lg p-4 bg-card hover:bg-accent transition-colors"
    >
      <Checkbox id={extra.id} />
      <Label
        htmlFor={extra.id}
        className="text-sm text-accent font-medium leading-none peer-disabled:cursor-none"
      >
        {extra.name}
      </Label>
    </div>
  ));
}
