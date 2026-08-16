import AddToCartButton from "@/components/menu/AddToCartButton";

export default function MenuItemTile({ onAddToCart, ...item }) {
  const {
    image,
    description,
    name,
    basePrice,
    sizes,
    extraIngredientPrices,
  } = item;

  const hasSizesOrExtras =
    sizes?.length > 0 || extraIngredientPrices?.length > 0;

  return (
    <div
      className="bg-gray-200 p-2 rounded-lg text-center
      group hover:bg-white hover:shadow-md hover:shadow-black/25
      transition-all flex flex-col h-full"
    >
      <div className="w-24 h-24 rounded-md overflow-hidden mx-auto mb-2 shrink-0">
        <img
          src={image}
          className="object-cover w-full h-full"
          alt={name}
        />
      </div>

      <h4 className="font-semibold text-xl my-3 shrink-0">
        {name}
      </h4>

      <div className="text-gray-500 text-sm min-h-[60px] line-clamp-3 px-1">
        {description || ""}
      </div>

      <AddToCartButton
        image={image}
        hasSizesOrExtras={hasSizesOrExtras}
        onClick={onAddToCart}
        basePrice={basePrice}
      />
    </div>
  );
}