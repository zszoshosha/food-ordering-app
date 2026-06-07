import Image from "next/image";

type MenuCardProps = {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
};

const fallbackBlurSvg =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjQwJyBoZWlnaHQ9JzQ4MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB4Mj0nMScgeTE9JzAnIHkyPScxJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjZjNlOGQ3Jy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjZjFkNWMzJy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzY0MCcgaGVpZ2h0PSc0ODAnIGZpbGw9J3VybCgjZyknLz48L3N2Zz4=";

const MenuCard = ({ name, image, price, description }: MenuCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-4/3 w-full">
        <Image
          src={image}
          alt={name}
          fill
          priority={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={fallbackBlurSvg}
        />
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold">{name}</h3>
          <span className="text-sm font-bold text-primary">
            ${price.toFixed(2)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
};

export default MenuCard;
