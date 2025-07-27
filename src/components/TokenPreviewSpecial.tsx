import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Message } from "../utils/BubbleSpecialInterfaces";
import ImageModal from "./ImageModal";
import RenderLinkPreview from "./RenderLinkPreview";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { motion } from "framer-motion";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import "swiper/css";
import { formatTime } from "@/utils";
import PDFModal from "./PdfModal";

const RenderFilePreview = dynamic(() => import("./RenderFilePreview"), {
  ssr: false,
});

interface TokenPreviewSpecialProps {
  currentIndex: number;
  allTokens: Message[];
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
  console.log('[TokenPreviewSpecial] Rendering with currentIndex:', currentIndex, 'total tokens:', allTokens.length);
  
  const swiperRef = useRef<{ swiper: SwiperType }>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ url: "", fallbackUrl: "", alt: "" });
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    console.log('[TokenPreviewSpecial] useEffect - currentIndex changed:', currentIndex);
    if (swiperRef.current?.swiper) {
      console.log('[TokenPreviewSpecial] Sliding to index:', currentIndex);
      swiperRef.current.swiper.slideTo(currentIndex, 300);
    }
  }, [currentIndex]);

  const openImageModal = useCallback((url: string, fallbackUrl: string, alt: string) => {
    console.log('[TokenPreviewSpecial] Opening image modal for:', url);
    setModalImage({ url, fallbackUrl, alt });
    setIsModalOpen(true);
  }, []);

  const closeImageModal = useCallback(() => {
    console.log('[TokenPreviewSpecial] Closing image modal');
    setIsModalOpen(false);
  }, []);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [modalPdf, setModalPdf] = useState({ pdfUrl: "", filename: "" });
  
  const openPdfModal = useCallback((pdfUrl: string, filename: string) => {
    console.log('[TokenPreviewSpecial] Opening PDF modal for:', filename);
    setModalPdf({ pdfUrl, filename });
    setIsPdfModalOpen(true);
  }, []);

  const handleMouseEnter = useCallback(
    () => {
      console.log('[TokenPreviewSpecial] Mouse entered - disabling drag');
      setIsDraggingDisabled(true);
    },
    [setIsDraggingDisabled]
  );

  const handleMouseLeave = useCallback(
    () => {
      console.log('[TokenPreviewSpecial] Mouse left - enabling drag');
      setIsDraggingDisabled(false);
    },
    [setIsDraggingDisabled]
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      console.log('[TokenPreviewSpecial] Slide changed to:', swiper.activeIndex);
      if (swiper.activeIndex !== currentIndex) {
        console.log('[TokenPreviewSpecial] Triggering onTokenSwipe with index:', swiper.activeIndex);
        onTokenSwipe(swiper.activeIndex);
      }
    },
    [currentIndex, onTokenSwipe]
  );

  const RenderContent = useMemo(
    () =>
      ({ token }: { token: Message }) => {
        console.log('[TokenPreviewSpecial] Rendering content for token type:', token.type);
        const filename = token.content.name || token.cloudFrontDownloadLink || "";
        const getFileExtension = (name: string) =>
          name.split(".").pop()?.toLowerCase() || "";
        const fileExtension = getFileExtension(filename);
        console.log('[TokenPreviewSpecial] File extension:', fileExtension);

        const isLink =
          token.type === "LINK" ||
          (!fileExtension &&
            (token.cloudFrontDownloadLink ?? "").startsWith("http"));
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
        const isJSON = /^json$/i.test(fileExtension);

        console.log('[TokenPreviewSpecial] Content type detection:', {
          isLink,
          isTimestamp,
          isReference,
          isImage,
          isVideo,
          isAudio,
          isPDF,
          isZip,
          isCSV,
          isExcel,
          isJSON
        });

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
              openImageModal={(url: string, alt: string) => openImageModal(token.optimisedImageUrl || url, url, alt)}
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
          const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(
            extension || ""
          );

          return (
            <RenderFilePreview
              url={token.optimisedImageUrl ?? ""}
              filename={token.content.referencedAttachment.name || ""}
              fileExtension={extension || ""}
              token={token}
              isImage={isImage}
              isVideo={isVideo}
              isAudio={isAudio}
              isPDF={isPDF}
              isZip={isZip}
              isCSV={isCSV}
              isExcel={isExcel}
              isJSON={isJSON}
              formatFileSize={formatFileSize}
              openImageModal={(url: string, alt: string) => openImageModal(token.optimisedImageUrl || url, url, alt)}
              openPdfModal={openPdfModal}
              thumbnailImage={
                token.content.referencedAttachment?.thumbnailImage || ""
              }
              startTimestamp={
                formatTime(token.content.startTime || 0) || undefined
              }
            />
          );
        }

        return (
          <RenderFilePreview
            url={token.optimisedImageUrl ?? ""}
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
            isJSON={isJSON}
            formatFileSize={formatFileSize}
            openImageModal={(url: string, alt: string) => openImageModal(token.optimisedImageUrl || url, url, alt)}
            openPdfModal={openPdfModal}
            thumbnailImage={
              token.content.referencedAttachment?.thumbnailImage || ""
            }
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
          watchSlidesProgress={true}
          onSlideChange={handleSlideChange}
          onTouchStart={() => setIsDraggingDisabled(true)}
          onTouchEnd={() => setIsDraggingDisabled(false)}
          className="w-full rounded-none"
        >
          {allTokens.map((token, idx) => (
            <SwiperSlide key={idx}>
              <motion.div
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
                {idx === currentIndex && <RenderContent token={token} />}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={closeImageModal}
        imageUrl={modalImage.url}
        cloudFrontUrl={modalImage.fallbackUrl}
        altText={modalImage.alt}
      />
      <PDFModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={modalPdf.pdfUrl}
        filename={modalPdf.filename}
      />
    </>
  );
}

export default TokenPreviewSpecial;