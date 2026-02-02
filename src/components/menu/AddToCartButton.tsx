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
import { ProductWithRelations } from "@/types/Product";
import { Size, Extra, ProductSize } from "@prisma/client";
import { useState, useMemo } from "react";
import {
  addCartItem,
  cartItem,
  selectCartItems,
} from "@/redux/features/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

/**
 * AddToCartButton component opens a dialog for customizing and adding an item to the cart.
 * Allows selection of size and extras, displays item details.
 * @param {Object} item - The menu item object.
 */
const AddToCartButton = ({ item }: { item: ProductWithRelations }) => {
  const cart = useAppSelector(selectCartItems);
  const extra = cart.find((cartItem) => cartItem.id === item.id)?.extras || [];
  const [selectedExtra, setSelectedExtra] = useState<Extra[]>(extra);
  const dispatch = useAppDispatch();
  const defaultSize =
    cart.find((cartItem) => cartItem.id === item.id)?.size ||
    item.sizes.find((size) => size.name.toUpperCase() === ProductSize.SMALL);
  const [selectedSize, setSelectedSize] = useState<Size>(defaultSize!);

  const totalPrice = useMemo(() => {
    const extrasTotal = selectedExtra.reduce(
      (sum, extra) => sum + extra.price,
      0,
    );
    return item.basePrice + selectedSize.price + extrasTotal;
  }, [item.basePrice, selectedSize.price, selectedExtra]);

  function AddToCartButton() {
    dispatch(
      addCartItem({
        size: selectedSize,
        extras: selectedExtra,
        basePrice: totalPrice,
        name: item.name,
        id: item.id,
        image: item.image,
      }),
    );
    return;
  }
  return (
    <Dialog>
      <>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="lg"
            className=" mt-4 text-white rounded-full px-8!"
          >
            add to cart
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25 max-h-[80vh] overflow-y-auto">
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
              <PickSize
                sizes={item.sizes}
                item={item}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />
            </div>
            <div className="space-y-4 text-center">
              <Label htmlFor="add-extras">Any Extras?</Label>
              <Extras
                extras={item.extras}
                selectedExtra={selectedExtra}
                setSelectedExtra={setSelectedExtra}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={AddToCartButton}>
              Add to Cart {formatCurrency(totalPrice)}
            </Button>
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
function PickSize({
  sizes,
  item,
  selectedSize,
  setSelectedSize,
}: {
  sizes: Size[];
  item: ProductWithRelations;
  selectedSize: Size;
  setSelectedSize: React.Dispatch<React.SetStateAction<Size>>;
}) {
  return (
    <RadioGroup
      aria-labelledby="pick-size"
      value={selectedSize.id}
      onValueChange={(value: string) => {
        const next = sizes.find((s) => s.id === value);
        if (next) {
          setSelectedSize(next);
        }
      }}
    >
      {sizes.map((size: Size) => (
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
 * @param {Array} selectedExtra - Currently selected extras.
 * @param {Function} setSelectedExtra - Function to update selected extras.
 */
function Extras({
  extras,
  selectedExtra,
  setSelectedExtra,
}: {
  extras: Extra[];
  selectedExtra: Extra[];
  setSelectedExtra: React.Dispatch<React.SetStateAction<Extra[]>>;
}) {
  return extras.map((extra: Extra) => (
    <div
      key={extra.id}
      className="flex items-center space-x-2 border border-border rounded-lg p-4 bg-card hover:bg-accent transition-colors"
    >
      <Checkbox
        id={extra.id}
        checked={selectedExtra.some((e) => e.id === extra.id)}
        onCheckedChange={(checked) => {
          const isChecked = Boolean(checked);
          if (isChecked) {
            setSelectedExtra([...selectedExtra, extra]);
            return;
          }

          setSelectedExtra(selectedExtra.filter((e) => e.id !== extra.id));
        }}
      />
      <Label
        htmlFor={extra.id}
        className="text-sm text-accent font-medium leading-none peer-disabled:cursor-none"
      >
        {extra.name}
        {formatCurrency(extra.price)}
      </Label>
    </div>
  ));
}
