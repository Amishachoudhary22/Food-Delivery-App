import { motion } from 'framer-motion';
import { CartContext } from "@/components/AppContext";
import MenuItemTile from "@/components/menu/MenuItemTile";
import Image from "next/legacy/image";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

export default function MenuItem(menuItem) {
  const {
    image,
    name,
    description,
    basePrice,
    sizes,
    extraIngredientPrices,
  } = menuItem;
  const [selectedSize, setSelectedSize] = useState(sizes?.[0] || null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { addToCart } = useContext(CartContext);
  const flyingButtonVariants = {
    rest: { scale: 1, y: 0 },
    fly: { scale: 1.0, y: -10 },
  };

  async function handleAddToCartButtonClick() {
    console.log('add to cart');
    const hasOptions = sizes.length > 0 || extraIngredientPrices.length > 0;
    if (hasOptions && !showPopup) {
      setShowPopup(true);
      return;
    }
    addToCart(menuItem, selectedSize, selectedExtras);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('hiding popup');
    setShowPopup(false);
  }

  function handleExtraThingClick(ev, extraThing) {
    const checked = ev.target.checked;
    if (checked) {
      setSelectedExtras(prev => [...prev, extraThing]);
    } else {
      setSelectedExtras(prev =>
        prev.filter(e => e.name !== extraThing.name)
      );
    }
  }

  let selectedPrice = basePrice;
  if (selectedSize) {
    selectedPrice += selectedSize.price;
  }
  if (selectedExtras?.length > 0) {
    for (const extra of selectedExtras) {
      selectedPrice += extra.price;
    }
  }

  const popupVariants = {
    open: { opacity: 1, scale: 1 },
    closed: { opacity: 0, scale: 0.8 },
  };

  return (
    <>
      {showPopup && (
        <motion.div
          onClick={() => setShowPopup(false)}
          variants={popupVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <motion.div
            onClick={ev => ev.stopPropagation()}
            className="my-8 bg-white p-2 rounded-lg max-w-md z-40"
          >
            <div className="overflow-y-scroll p-2" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <Image src={image} alt={name} width={300} height={200} className="mx-auto" />
              <h2 className="text-lg font-bold text-center mb-2">{name}</h2>
              <p className="text-center text-gray-500 text-sm mb-2">{description}</p>
              {sizes?.length > 0 && (
                <div className="py-2">
                  <h3 className="text-center text-gray-700">Pick your size</h3>
                  {sizes.map(size => (
                    <label
                      key={size._id}
                      className="flex items-center gap-2 p-4 border rounded-md mb-1"
                    >
                      <input
                        type="radio"
                        onChange={() => setSelectedSize(size)}
                        checked={selectedSize?.name === size.name}
                        name="size"
                      />
                      {size.name} ${basePrice + size.price}
                    </label>
                  ))}
                </div>
              )}
              {extraIngredientPrices?.length > 0 && (
                <div className="py-2">
                  <h3 className="text-center text-gray-700">Any extras?</h3>
                  {extraIngredientPrices.map(extraThing => (
                    <label
                      key={extraThing._id}
                      className="flex items-center gap-2 p-4 border rounded-md mb-1"
                    >
                      <input
                        type="checkbox"
                        onChange={ev => handleExtraThingClick(ev, extraThing)}
                        checked={selectedExtras.map(e => e._id).includes(extraThing._id)}
                        name={extraThing.name}
                      />
                      {extraThing.name} +${extraThing.price}
                    </label>
                  ))}
                </div>
              )}
              <motion.div
                className="primary sticky bottom-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 cursor-pointer"
                variants={flyingButtonVariants}
                initial="rest"
                animate={addToCart ? "fly" : "rest"} // Animate on addToCart
                onClick={handleAddToCartButtonClick}
              >
                Add to cart ${selectedPrice}
              </motion.div>
              <button className="mt-2" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <MenuItemTile onAddToCart={handleAddToCartButtonClick} {...menuItem} />
    </>
  );
}