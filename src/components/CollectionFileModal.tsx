import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { truncateFilename } from "./TruncateText";
import Image from "next/image";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import UniversalFilePreview from "./UniversalFilePreview";
import useIsMobile from "@/utils";

interface CollectionFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Message[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function CollectionFileModal({
  isOpen,
  onClose,
  files,
  currentIndex,
  onIndexChange,
}: CollectionFileModalProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentFile = files[currentIndex];

  // Pagination logic for navigation dots - show 3 dots on each side
  const visibleDots = useMemo(() => {
    const dots = [];
    const maxDotsOnEachSide = 3;

    // Calculate start and end indices for visible dots
    const startIndex = Math.max(0, currentIndex - maxDotsOnEachSide);
    const endIndex = Math.min(
      files.length,
      currentIndex + maxDotsOnEachSide + 1
    );

    for (let i = startIndex; i < endIndex; i++) {
      dots.push({
        file: files[i],
        actualIndex: i,
      });
    }

    return dots;
  }, [files, currentIndex]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
      if (event.key === "ArrowRight" && currentIndex < files.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose, currentIndex, files.length, onIndexChange]);

  const handleDownload = async () => {
    if (!currentFile) return;

    setIsDownloading(true);
    try {
      const downloadUrl = currentFile.cloudFrontDownloadLink;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile.content.name || `file-${currentIndex + 1}`;
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
    if (currentIndex < files.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  if (!currentFile) return null;

  const isMobile = useIsMobile();

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
          <div className="max-w-screen-2xl mx-auto relative w-full">
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close modal"
              >
                <X size={24} className="text-primary" />
              </button>

              {/* Navigation Controls */}
              <div className="flex items-center gap-x-4">
                {files.length > 1 && (
                  <>
                    {/* Dots Navigation */}
                    <div className="flex items-center space-x-2">
                      {visibleDots.map(({ file, actualIndex }) => {
                        const distanceFromCurrent = Math.abs(
                          actualIndex - currentIndex
                        );
                        const dotSize = Math.max(
                          6,
                          12 - distanceFromCurrent * 2
                        );

                        return (
                          <button
                            key={actualIndex}
                            onClick={() => onIndexChange(actualIndex)}
                            className={`rounded-full transition-all ${
                              actualIndex === currentIndex
                                ? "bg-gradient-to-b from-[#7E7E7E] to-[#191919E5] px-3 py-1"
                                : `bg-[#191919]/40 hover:bg-[#191919]/60`
                            }`}
                            style={{
                              width:
                                actualIndex === currentIndex
                                  ? "auto"
                                  : `${dotSize}px`,
                              height:
                                actualIndex === currentIndex
                                  ? "auto"
                                  : `${dotSize}px`,
                            }}
                            aria-label={`Go to file ${actualIndex + 1}`}
                          >
                            {actualIndex === currentIndex && (
                              <span className="text-white text-xs truncate max-w-[100px] block">
                                {truncateFilename(
                                  file.content.name || "Untitled",
                                  false
                                )}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-x-2 px-2 md:px-4 py-2 text-sm bg-secondary text-white rounded-full transition-colors disabled:opacity-50"
                aria-label="Download file"
              >
                <Image src={whiteDownloadIcon} alt="Download" />
                <span className={`${isMobile ? "hidden" : ""}`}>
                  Download file
                </span>
              </button>
            </motion.div>

            {/* File Container */}
            <div
              className="flex-1 flex items-center justify-center py-4 px-4 max-h-[95vh] h-full"
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
                className="relative max-w-full max-h-full w-full h-full"
              >
                <div className="flex items-center justify-center relative">
                  <UniversalFilePreview
                    token={currentFile}
                    disableModals={true}
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-2 py-1 bg-[#EBEBEBBF] text-xs text-secondary rounded-full text-center border border-[#1919191A]">
                      {truncateFilename(
                        currentFile.content.name || "Untitled",
                        true
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation Arrows for Large Screens */}
            {files.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/50 text-white transition-all ${
                    currentIndex === 0
                      ? "opacity-25 cursor-not-allowed"
                      : "hover:bg-black/70 opacity-0 hover:opacity-100"
                  } ${isHovered ? "opacity-100" : ""}`}
                  aria-label="Previous file"
                >
                  <ChevronLeft className="text-sm md:text-base lg:text-lg" />
                </button>

                <button
                  onClick={goToNext}
                  disabled={currentIndex === files.length - 1}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/50 text-white transition-all ${
                    currentIndex === files.length - 1
                      ? "opacity-25 cursor-not-allowed"
                      : "hover:bg-black/70 opacity-0 hover:opacity-100"
                  } ${isHovered ? "opacity-100" : ""}`}
                  aria-label="Next file"
                >
                  <ChevronRight className="text-sm md:text-base lg:text-lg" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
