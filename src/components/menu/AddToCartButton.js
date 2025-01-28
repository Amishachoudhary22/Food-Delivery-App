import { motion } from 'framer-motion';
import Image from "next/legacy/image"; 

export default function AddToCartButton({
    hasSizesOrExtras, onClick, basePrice, image,
}) {
    const buttonVariants = {
        hover: { scale: 1.05 }, // Slightly scale up on hover
        tap: { scale: 0.95 },   // Slightly scale down on tap
    };

    const imageVariants = {
        initial: { opacity: 0, scale: 0.5, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.5, y: -20 },
    };

    if (!hasSizesOrExtras) {
        return (
            <div className="flying-button-parent mt-4 relative"> {/* Make parent relative */}
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
                    {image && (
                        <Image src={image} alt="Cart Icon" width={50} height={50} />
                    )}
                    <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ duration: 0.2 }}
                        className="bg-primary text-white rounded-full px-4 py-2 mt-2" // Add some styling
                    >
                        Add to cart ${basePrice}
                    </motion.div>
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
            className="mt-4 bg-primary text-white rounded-full px-8 py-2"
        >
            <span>Add to cart (from ${basePrice})</span>
        </motion.button>
    );
}