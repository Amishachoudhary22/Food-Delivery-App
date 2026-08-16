import { motion } from 'framer-motion';

export default function AddToCartButton({
  hasSizesOrExtras,
  onClick,
  basePrice,
}) {
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="mt-auto min-h-[44px] flex items-center justify-center pt-2">
      <motion.button
        type="button"
        onClick={onClick}
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        transition={{ duration: 0.2 }}
        className="bg-primary text-white rounded-full px-6 py-2 flex items-center justify-center whitespace-nowrap"
      >
        <span>
          Add to cart ${basePrice}
          {hasSizesOrExtras ? '+' : ''}
        </span>
      </motion.button>
    </div>
  );
}
