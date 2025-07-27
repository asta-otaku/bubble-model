import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { truncateFilename } from "./TruncateText";
import Image from "next/image";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";

interface CollectionImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Message[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function CollectionImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}: CollectionImageModalProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  const currentImage = images[currentIndex];

  // Pagination logic for navigation dots
  const dotsPerPage = 7; // Show max 7 dots at a time
  const totalPages = Math.ceil(images.length / dotsPerPage);
  const currentPage = Math.floor(currentIndex / dotsPerPage);

  const visibleDots = useMemo(() => {
    const startIndex = currentPage * dotsPerPage;
    const endIndex = Math.min(startIndex + dotsPerPage, images.length);
    return images.slice(startIndex, endIndex).map((image, idx) => ({
      image,
      actualIndex: startIndex + idx,
    }));
  }, [images, currentPage, dotsPerPage]);

  // Preload images for smooth transitions
  useEffect(() => {
    if (!currentImage) return;

    const preloadImage = (url: string) => {
      if (preloadedImages.has(url)) return;

      const img = new window.Image();
      img.onload = () => {
        setPreloadedImages((prev) => new Set(prev).add(url));
      };
      img.src = url;
    };

    // Preload current image
    preloadImage(currentImage.cloudFrontDownloadLink);

    // Preload adjacent images for smooth navigation
    if (currentIndex > 0) {
      const prevImage = images[currentIndex - 1];
      if (prevImage) {
        preloadImage(prevImage.cloudFrontDownloadLink);
      }
    }

    if (currentIndex < images.length - 1) {
      const nextImage = images[currentIndex + 1];
      if (nextImage) {
        preloadImage(nextImage.cloudFrontDownloadLink);
      }
    }
  }, [currentImage, currentIndex, images, preloadedImages]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
      if (event.key === "ArrowRight" && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose, currentIndex, images.length, onIndexChange]);

  const handleDownload = async () => {
    if (!currentImage) return;

    setIsDownloading(true);
    try {
      const response = await fetch(currentImage.cloudFrontDownloadLink);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.content.name || `image-${currentIndex + 1}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const goToPrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const goToNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const newIndex = Math.max((currentPage - 1) * dotsPerPage, 0);
      onIndexChange(newIndex);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newIndex = Math.min(
        (currentPage + 1) * dotsPerPage,
        images.length - 1
      );
      onIndexChange(newIndex);
    }
  };

  if (!currentImage) return null;

  const getDisplayUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return { hostname: parsed.hostname, origin: parsed.origin };
    } catch (error) {
      return { hostname: "", origin: "" };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-white"
          onClick={onClose}
        >
          {/* Navigation Bar */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`flex items-center justify-between p-4 text-white transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={onClose} aria-label="Close modal">
              <X size={24} className="text-primary" />
            </button>

            {/* Navigation Controls */}
            <div className="flex items-center gap-x-4">
              {images.length > 1 && (
                <>
                  {/* Pagination Navigation */}
                  <div className="flex items-center space-x-2">
                    {/* Previous page button */}
                    {totalPages > 1 && currentPage > 0 && (
                      <button
                        onClick={goToPreviousPage}
                        className="p-1 rounded-full bg-[#191919]/40 hover:bg-[#191919]/60 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronsLeft size={16} className="text-white" />
                      </button>
                    )}

                    {/* Dots Navigation */}
                    <div className="flex items-center space-x-2">
                      {visibleDots.map(({ image, actualIndex }) => (
                        <button
                          key={actualIndex}
                          onClick={() => onIndexChange(actualIndex)}
                          className={`rounded-full transition-all ${
                            actualIndex === currentIndex
                              ? "bg-gradient-to-b from-[#7E7E7E] to-[#191919E5] px-3 py-1"
                              : "w-2 h-2 bg-[#191919]/40 hover:bg-[#191919]/60"
                          }`}
                          aria-label={`Go to image ${actualIndex + 1}`}
                        >
                          {actualIndex === currentIndex && (
                            <span className="text-white text-xs truncate max-w-[100px] block">
                              {truncateFilename(
                                image.content.name ||
                                  getDisplayUrl(image.content.url).hostname ||
                                  "Untitled",
                                false
                              )}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Next page button */}
                    {totalPages > 1 && currentPage < totalPages - 1 && (
                      <button
                        onClick={goToNextPage}
                        className="p-1 rounded-full bg-[#191919]/40 hover:bg-[#191919]/60 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronsRight size={16} className="text-white" />
                      </button>
                    )}

                    {/* Page indicator */}
                    {totalPages > 1 && (
                      <span className="text-xs text-white/70 ml-2">
                        {currentPage + 1} / {totalPages}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-x-2 px-2 md:px-4 py-2 text-sm bg-secondary text-white rounded-full transition-colors disabled:opacity-50"
              aria-label="Download image"
            >
              <Image src={whiteDownloadIcon} alt="Download all" />
              <span className="hidden md:block">Download image</span>
            </button>
          </motion.div>

          {/* Image Container */}
          <div
            className="flex-1 flex items-center justify-center py-4"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-full"
            >
              <img
                src={currentImage.cloudFrontDownloadLink}
                alt={currentImage.content.name}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                loading="eager"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="px-2 py-1 bg-[#EBEBEBBF] text-xs text-secondary rounded-full text-center border border-[#1919191A]">
                  {truncateFilename(
                    currentImage.content.name || "Untitled",
                    true
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Arrows for Large Screens */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/50 text-white transition-all ${
                  currentIndex === 0
                    ? "opacity-25 cursor-not-allowed"
                    : "hover:bg-black/70 opacity-0 hover:opacity-100"
                } ${isHovered ? "opacity-100" : ""}`}
                aria-label="Previous image"
              >
                <ChevronLeft className="text-sm md:text-base lg:text-lg" />
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === images.length - 1}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/50 text-white transition-all ${
                  currentIndex === images.length - 1
                    ? "opacity-25 cursor-not-allowed"
                    : "hover:bg-black/70 opacity-0 hover:opacity-100"
                } ${isHovered ? "opacity-100" : ""}`}
                aria-label="Next image"
              >
                <ChevronRight className="text-sm md:text-base lg:text-lg" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}