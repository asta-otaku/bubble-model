import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SlClose } from "react-icons/sl";
// import Image from "next/image";

function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  cloudFrontUrl,
  altText,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  cloudFrontUrl?: string;
  altText: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  const handleImageError = () => {
    if (cloudFrontUrl && currentImageUrl === imageUrl) {
      setCurrentImageUrl(cloudFrontUrl);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="relative w-auto h-full"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={onClose}
              className={`absolute top-0 left-5 p-2 text-white hover:text-gray-300 transition-colors ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Close modal"
            >
              <SlClose size={24} />
            </button>
            <img
              src={currentImageUrl}
              alt={altText}
              width={800}
              height={800}
              className="h-full w-auto object-contain"
              onError={handleImageError}
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ImageModal;
