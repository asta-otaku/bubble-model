import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { AttachmentContentPreview } from "../utils/BubbleSpecialInterfaces";
import ImageModal from "./ImageModal";
import dynamic from "next/dynamic";
import RenderLinkPreview from "./RenderLinkPreview";

const RenderFilePreview = dynamic(() => import("./RenderFilePreview"), {
  ssr: false,
});

// Import Swiper styles
import "swiper/css";

interface TokenPreviewSpecialProps {
  currentIndex: number;
  allTokens: AttachmentContentPreview[];
  onTokenSwipe: (index: number) => void;
  setIsDraggingDisabled: (disabled: boolean) => void;
}

function TokenPreviewSpecial({
  currentIndex,
  allTokens,
  onTokenSwipe,
  setIsDraggingDisabled,
}: TokenPreviewSpecialProps) {
  const swiperRef = useRef<SwiperRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; alt: string }>({
    url: "",
    alt: "",
  });

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideTo(currentIndex);
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
    (swiper: any) => {
      if (swiper.activeIndex !== currentIndex) {
        onTokenSwipe(swiper.activeIndex);
      }
    },
    [currentIndex, onTokenSwipe]
  );

  const RenderContent = useMemo(
    () =>
      ({ token }: { token: AttachmentContentPreview }) => {
        const filename = token.content?.name || token.name || "";
        const getFileExtension = (filename: string) =>
          filename.split(".").pop()?.toLowerCase() || "";
        const fileExtension = getFileExtension(filename);

        const isLink =
          token.type === "LINK" ||
          (!fileExtension && (token.url ?? "").startsWith("http"));
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

        return (
          <RenderFilePreview
            url={token?.cloudFrontDownloadLink ?? ""}
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
          initialSlide={currentIndex}
          autoHeight={true}
          onSlideChange={handleSlideChange}
          className="w-full rounded-none"
        >
          {allTokens.map((token, index) => (
            <SwiperSlide
              key={index}
              className="inline-flex items-center justify-center p-0 m-0 w-auto h-auto"
              style={{ lineHeight: "normal" }}
            >
              <RenderContent token={token} />
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
