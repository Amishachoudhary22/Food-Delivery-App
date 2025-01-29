import { cartProductPrice } from "@/components/AppContext";
import Trash from "@/components/icons/Trash";
import Image from "next/legacy/image";

export default function CartProduct({ product, index, onRemove, updateQuantity }) {
  const { name, image, size, extras, quantity } = product;

  return (
    <div className="flex items-center gap-4 border-b py-4">
      {/* Ensure fixed size for the image container */}
      <div className="w-15 h-15 overflow-hidden flex-shrink-0">
        <Image
          width={96}
          height={96}
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>
      {/* Ensure consistent width for this text section */}
      <div className="grow">
        <h3 className="font-semibold text-lg">{name}</h3>
        {size && (
          <div className="text-sm">
            Size: <span>{size.name}</span>
          </div>
        )}
        {extras?.length > 0 && (
          <div className="text-sm text-gray-500">
            {extras.map((extra) => (
              <div key={extra.name}>{extra.name} ${extra.price}</div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center">
        {/* Product Price */}
        <div className="text-lg font-semibold mr-4">
          ${cartProductPrice(product)}
        </div>
        {/* Adjusted quantity buttons */}
        <div className="flex items-center gap-1 border border-orange-500 rounded-lg py-0.4 px-1 text-xs">
          <span
            onClick={() => updateQuantity(index, quantity - 1)}
            className="cursor-pointer text-sm font-bold text-orange-500 hover:text-black focus:outline-none"
            style={{ userSelect: "none", padding: "0 0px" }}
          >
            −
          </span>
          <span className="font-semibold px-1">{quantity}</span>
          <span
            onClick={() => updateQuantity(index, quantity + 1)}
            className="cursor-pointer text-sm font-bold text-orange-500 hover:text-black focus:outline-none"
            style={{ userSelect: "none", padding: "0 0px" }}
          >
            +
          </span>
        </div>
      </div>
      {!!onRemove && (
        <div className="ml-2">
          <button
            type="button"
            onClick={() => onRemove(index)} // Use the index passed as a prop
            className="p-2"
          >
            <Trash />
          </button>
        </div>
      )}
    </div>
  );
}
