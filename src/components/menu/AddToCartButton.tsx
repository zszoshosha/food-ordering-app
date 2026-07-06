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
import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  addCartItem,
  removeCartItem,
  selectCartItems,
} from "@/redux/features/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getCartItemQuantity } from "@/lib/cart";
import { toast } from "sonner";

/**
 * Renders the add-to-cart trigger and customization dialog for a product.
 * Users can pick size, extras, and adjust quantity for the same configuration.
 * @param {Object} item - Product data with sizes and extras.
 */
const AddToCartButton = ({ item }: { item: ProductWithRelations }) => {
  const cart = useAppSelector(selectCartItems);
  const extra = cart.find((cartItem) => cartItem.id === item.id)?.extras || [];
  const [selectedExtra, setSelectedExtra] = useState<Extra[]>(extra);
  const dispatch = useAppDispatch();
  const defaultSize =
    cart.find((cartItem) => cartItem.id === item.id)?.size ||
    item.sizes.find((size) => size.name.toUpperCase() === ProductSize.SMALL) ||
    item.sizes[0] ||
    null;
  const [selectedSize, setSelectedSize] = useState<Size | null>(defaultSize);
  const itemQuantity = getCartItemQuantity(item.id, cart);
  const [optimisticResetVersion, setOptimisticResetVersion] = useState(0);
  const [optimisticQuantity, applyOptimisticQuantity] = useOptimistic(
    { quantity: itemQuantity, resetVersion: optimisticResetVersion },
    (currentState, action: { type: "increase" | "decrease" }) => ({
      ...currentState,
      quantity:
        action.type === "increase"
          ? currentState.quantity + 1
          : Math.max(0, currentState.quantity - 1),
    }),
  );
  const [isPending, startTransition] = useTransition();
  const displayedQuantity = optimisticQuantity.quantity;
  const totalPrice = useMemo(() => {
    const extrasTotal = selectedExtra.reduce(
      (sum, extra) => sum + Number(extra?.price || 0),
      0,
    );
    return (
      Number(item.basePrice || 0) +
      Number(selectedSize?.price || 0) +
      extrasTotal
    );
  }, [item.basePrice, selectedSize?.price, selectedExtra]);

  const handleCartMutation = (type: "increase" | "decrease") => {
    const toastId = toast.loading(
      type === "increase" ? "Adding item to cart..." : "Updating cart...",
    );

    startTransition(() => {
      applyOptimisticQuantity({ type });

      try {
        if (type === "increase") {
          dispatch(
            addCartItem({
              size: selectedSize ?? undefined,
              extras: selectedExtra,
              basePrice: item.basePrice,
              name: item.name,
              id: item.id,
              image: item.image,
            }),
          );
        } else {
          dispatch(removeCartItem({ id: item.id }));
        }

        toast.success(
          type === "increase" ? "Added to cart." : "Cart updated.",
          {
            id: toastId,
          },
        );
      } catch {
        setOptimisticResetVersion((current) => current + 1);
        toast.error("Failed to update cart.", { id: toastId });
      }
    });
  };
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
              {item.sizes.length > 0 ? (
                <PickSize
                  sizes={item.sizes}
                  item={item}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No size options available.
                </p>
              )}
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
            {displayedQuantity === 0 ? (
              <Button
                type="submit"
                onClick={() => handleCartMutation("increase")}
                disabled={isPending}
              >
                Add to Cart {formatCurrency(totalPrice)}
              </Button>
            ) : (
              <ChooseQuantity
                item={item}
                totalPrice={totalPrice}
                itemQuantity={displayedQuantity}
                isPending={isPending}
                onIncrease={() => handleCartMutation("increase")}
                onDecrease={() => handleCartMutation("decrease")}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </>
    </Dialog>
  );
};

export default AddToCartButton;

/**
 * Renders size options as a radio group.
 * @param {Size[]} sizes - Available size options.
 * @param {ProductWithRelations} item - Product used to compute displayed price.
 */
function PickSize({
  sizes,
  item,
  selectedSize,
  setSelectedSize,
}: {
  sizes: Size[];
  item: ProductWithRelations;
  selectedSize: Size | null;
  setSelectedSize: React.Dispatch<React.SetStateAction<Size | null>>;
}) {
  return (
    <RadioGroup
      aria-labelledby="pick-size"
      value={selectedSize?.id || ""}
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
 * Renders optional extras as checkboxes.
 * @param {Extra[]} extras - Available extra options.
 * @param {Extra[]} selectedExtra - Currently selected extras.
 * @param {React.Dispatch<React.SetStateAction<Extra[]>>} setSelectedExtra - State updater.
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
        {formatCurrency(Number(extra.price || 0))}
      </Label>
    </div>
  ));
}

/**
 * Quantity controls shown when an item configuration already exists in the cart.
 */
const ChooseQuantity = ({
  item,
  totalPrice,
  itemQuantity,
  isPending,
  onIncrease,
  onDecrease,
}: {
  item: ProductWithRelations;
  totalPrice: number;
  itemQuantity: number;
  isPending: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-full px-3 py-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full w-9 h-9 p-0"
          onClick={onDecrease}
          disabled={itemQuantity <= 1}
        >
          -
        </Button>
        <span className="min-w-6 text-center font-semibold">
          {itemQuantity}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full w-9 h-9 p-0"
          onClick={onIncrease}
          disabled={isPending}
        >
          +
        </Button>
      </div>

      <Button
        type="button"
        onClick={onIncrease}
        className="w-full sm:w-auto"
        disabled={isPending}
      >
        Add More {formatCurrency(totalPrice)}
      </Button>
    </div>
  );
};
