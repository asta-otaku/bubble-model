import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { truncateFilename } from "../TruncateText";
import Image from "next/image";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import CollectionFileModalPreview from "./CollectionFileModalPreview";
import useIsMobile from "@/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const swiperRef = useRef<{ swiper: SwiperType }>(null);
  const currentMediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(
    null
  );

  const currentFile = files[currentIndex];

  // Function to pause all media
  const pauseAllMedia = useCallback(() => {
    // Pause current media if it exists
    if (currentMediaRef.current) {
      currentMediaRef.current.pause();
      currentMediaRef.current = null;
    }

    // Also pause any other media elements that might be playing
    const allMediaElements = document.querySelectorAll("video, audio");
    allMediaElements.forEach((media) => {
      if (
        media instanceof HTMLVideoElement ||
        media instanceof HTMLAudioElement
      ) {
        media.pause();
      }
    });
  }, []);

  // Function to set current media ref
  const setCurrentMediaRef = useCallback(
    (mediaElement: HTMLVideoElement | HTMLAudioElement | null) => {
      currentMediaRef.current = mediaElement;
    },
    []
  );

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

  // Update swiper when currentIndex changes
  useEffect(() => {
    if (swiperRef.current?.swiper && isOpen) {
      swiperRef.current.swiper.slideTo(currentIndex, 300);
    }
  }, [currentIndex, isOpen]);

  // Handle slide change from swiper
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      if (swiper.activeIndex !== currentIndex) {
        // Pause all media before changing slides
        pauseAllMedia();
        onIndexChange(swiper.activeIndex);
      }
    },
    [currentIndex, onIndexChange, pauseAllMedia]
  );

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        pauseAllMedia();
        onIndexChange(currentIndex - 1);
      }
      if (event.key === "ArrowRight" && currentIndex < files.length - 1) {
        pauseAllMedia();
        onIndexChange(currentIndex + 1);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [
    isOpen,
    onClose,
    currentIndex,
    files.length,
    onIndexChange,
    pauseAllMedia,
  ]);

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

  const isMobile = useIsMobile();

  if (!currentFile) return null;

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
                            onClick={() => {
                              if (swiperRef.current?.swiper) {
                                swiperRef.current.swiper.slideTo(
                                  actualIndex,
                                  300
                                );
                              }
                            }}
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
                                  file.content.name ||
                                    getDisplayUrl(file.content.url).hostname ||
                                    "Untitled",
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
              className="flex-1 flex items-center justify-center py-4 px-4 max-h-[85vh] h-full"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Swiper
                ref={swiperRef}
                spaceBetween={0}
                slidesPerView={1}
                autoHeight
                watchSlidesProgress={true}
                onSlideChange={handleSlideChange}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
                allowTouchMove={true}
                resistance={true}
                resistanceRatio={0.85}
                speed={300}
                className="w-full h-full"
                initialSlide={currentIndex}
              >
                {files.map((file, index) => {
                  return (
                    <SwiperSlide key={index}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
                      >
                        <div className="flex items-center justify-center relative w-full h-full">
                          <CollectionFileModalPreview
                            token={file}
                            disableModals={true}
                            setCurrentMediaRef={setCurrentMediaRef}
                          />
                          <div
                            className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-200 ${
                              isHovered ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <div className="px-2 py-1 bg-[#EBEBEBBF] text-xs text-secondary rounded-full text-center border border-[#1919191A]">
                              {truncateFilename(
                                file.content.name ||
                                  getDisplayUrl(file.content.url).hostname ||
                                  "Untitled",
                                true
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
