import AddToCartButton from "@/components/menu/AddToCartButton";

export default function MenuItemTile({onAddToCart, ...item}) {
const {image, description, name, basePrice,
sizes, extraIngredientPrices,
} = item;
const hasSizesOrExtras = sizes?.length > 0 || extraIngredientPrices?.length > 0;
return (
<div className="bg-gray-200 p-2 rounded-lg text-center 
group hover:bg-white hover:shadow-md hover:shadow-black/25 transition-all">
<div className="w-24 h-24 rounded-md overflow-hidden mx-auto mb-2">
<img src={image} className="object-cover w-full h-full" alt="pizza"/>
</div>
<h4 className="font-semibold text-xl my-3">{name}</h4>
<p className="text-gray-500 text-sm line-clamp-3">
{description}
</p>
<AddToCartButton
image={image}
hasSizesOrExtras={hasSizesOrExtras}
onClick={onAddToCart}
basePrice={basePrice}
/>
</div>
);
}