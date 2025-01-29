import { motion } from 'framer-motion';
import Image from "next/legacy/image";

export default function AddToCartButton({
hasSizesOrExtras, onClick, basePrice, image,
}) {
const buttonVariants = {
hover: { scale: 1.05 }, // Slightly scale up on hover
tap: { scale: 0.95 }, // Slightly scale down on tap
};

const imageVariants = {
initial: { opacity: 0, scale: 0.5, y: 20 },
animate: { opacity: 1, scale: 1, y: 0 },
exit: { opacity: 0, scale: 0.5, y: -20 },
};

if (!hasSizesOrExtras) {
return (
<div className="flying-button-parent mt-1 relative"> {/* Make parent relative */}
<motion.div
className="absolute z-10" // Position absolutely and bring to front
style={{ top: '0%', left: '0%', cursor: 'pointer' }}
variants={imageVariants}
initial="initial"
animate="animate"
exit="exit"
transition={{ type: "spring", stiffness: 100, damping: 10 }}
onClick={onClick}
>
<motion.button
type="button"
onClick={onClick}
whileHover="hover"
whileTap="tap"
variants={buttonVariants}
transition={{ duration: 0.2 }}
className="bg-primary text-white rounded-full px-16 py-1.5 flex items-center justify-center" // Center content
>
<span>Add to cart ${basePrice}</span>
</motion.button>
</motion.div>
</div>
);
}

return (
<motion.button
type="button"
onClick={onClick}
whileHover="hover"
whileTap="tap"
variants={buttonVariants}
transition={{ duration: 0.2 }}
className="bg-primary text-white rounded-full px-4 py-2 flex items-center justify-center" // Center content
>
<span>Add to cart ${basePrice}</span>
</motion.button>
);
}