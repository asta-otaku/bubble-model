import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Attachment } from "../utils/BubbleSpecialInterfaces";
import ImageModal from "./ImageModal";
import RenderLinkPreview from "./RenderLinkPreview";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { motion } from "framer-motion";

import "swiper/css";
import { formatTime } from "@/utils";

const RenderFilePreview = dynamic(() => import("./RenderFilePreview"), {
  ssr: false,
});

interface TokenPreviewSpecialProps {
  currentIndex: number;
  allTokens: Attachment[];
  onTokenSwipe: (index: number) => void;
  setIsDraggingDisabled: (disabled: boolean) => void;
  direction: number;
}

function TokenPreviewSpecial({
  currentIndex,
  allTokens,
  onTokenSwipe,
  setIsDraggingDisabled,
  direction,
}: TokenPreviewSpecialProps) {
  const swiperRef = useRef<{ swiper: SwiperType }>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ url: "", alt: "" });
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideTo(currentIndex, 300);
    }
  }, [currentIndex]);

  const openImageModal = useCallback((url: string, alt: string) => {
    setModalImage({ url, alt });
    setIsModalOpen(true);
  }, []);
  const closeImageModal = useCallback(() => setIsModalOpen(false), []);

  const handleMouseEnter = useCallback(
    () => setIsDraggingDisabled(true),
    [setIsDraggingDisabled]
  );
  const handleMouseLeave = useCallback(
    () => setIsDraggingDisabled(false),
    [setIsDraggingDisabled]
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      if (swiper.activeIndex !== currentIndex) {
        onTokenSwipe(swiper.activeIndex);
      }
    },
    [currentIndex, onTokenSwipe]
  );

  const RenderContent = useMemo(
    () =>
      ({ token }: { token: Attachment }) => {
        const filename = token.content?.name || "";
        const getFileExtension = (name: string) =>
          name.split(".").pop()?.toLowerCase() || "";
        const fileExtension = getFileExtension(filename);

        const isLink =
          token.type === "LINK" ||
          (!fileExtension && (token.content.url ?? "").startsWith("http"));
        const isTimestamp = token.type === "TIMESTAMP";
        const isReference = token.type === "REFERENCE";
        const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(
          fileExtension
        );
        const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
        const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
        const isPDF = /^pdf$/i.test(fileExtension);
        const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
        const isCSV = /^csv$/i.test(fileExtension);
        const isExcel = /^(xls|xlsx)$/i.test(fileExtension);

        const formatFileSize = (bytes?: number) => {
          if (!bytes) return "";
          const units = ["B", "KB", "MB", "GB"];
          let size = bytes;
          let unitIndex = 0;
          while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
          }
          return `${size.toFixed(1)} ${units[unitIndex]}`;
        };

        if (isLink) {
          return (
            <RenderLinkPreview
              token={token}
              setFaviconError={() => {}}
              faviconError={false}
              openImageModal={openImageModal}
              getDisplayUrl={(url: string) => {
                const { hostname, origin } = new URL(url);
                return { hostname, origin };
              }}
            />
          );
        }

        if (isTimestamp || isReference) {
          const extension = token.cloudFrontDownloadLink
            ?.split(".")
            .pop()
            ?.toLowerCase();
          const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(extension || "");
          const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(extension || "");

          return (
            <RenderFilePreview
              url={token.cloudFrontDownloadLink ?? ""}
              filename={token.content.parentAttachment?.fileName || ""}
              fileExtension={extension || ""}
              token={token}
              isImage={isImage}
              isVideo={isVideo}
              isAudio={isAudio}
              isPDF={isPDF}
              isZip={isZip}
              isCSV={isCSV}
              isExcel={isExcel}
              formatFileSize={formatFileSize}
              openImageModal={openImageModal}
              thumbnailImage={token.content?.thumbnailImage || ""}
              startTimestamp={formatTime(token.content.startTime || 0)}
            />
          );
        }

        return (
          <RenderFilePreview
            url={token.cloudFrontDownloadLink ?? ""}
            filename={filename}
            fileExtension={fileExtension}
            token={token}
            isImage={isImage}
            isVideo={isVideo}
            isAudio={isAudio}
            isPDF={isPDF}
            isZip={isZip}
            isCSV={isCSV}
            isExcel={isExcel}
            formatFileSize={formatFileSize}
            openImageModal={openImageModal}
            thumbnailImage={token.content?.thumbnailImage || ""}
          />
        );
      },
    [openImageModal]
  );

  return (
    <>
      <div
        className="w-full bg-white rounded-2xl relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Swiper
          ref={swiperRef}
          spaceBetween={0}
          slidesPerView={1}
          autoHeight
          // Called whenever a new slide becomes active
          onSlideChange={handleSlideChange}
          // Let Swiper handle pointer/touch dragging
          onTouchStart={() => setIsDraggingDisabled(true)}
          onTouchEnd={() => setIsDraggingDisabled(false)}
          className="w-full rounded-none"
        >
          {allTokens.map((token, idx) => (
            <SwiperSlide key={idx}>
              <motion.div
                // If you want manual detection, you can also do:
                onMouseDown={(e) => setStartX(e.clientX)}
                onMouseUp={(e) => {
                  const delta = e.clientX - startX;
                  if (delta > 50) {
                    swiperRef.current?.swiper.slidePrev(300);
                  } else if (delta < -50) {
                    swiperRef.current?.swiper.slideNext(300);
                  }
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <RenderContent token={token} />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={closeImageModal}
        imageUrl={modalImage.url}
        altText={modalImage.alt}
      />
    </>
  );
}

export default TokenPreviewSpecial;
