import { useState, useCallback, useEffect } from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import PDFModal from "./PdfModal";
import BubbleAudioPlayer from "./BubbleAudioPlayer";
import MuxVideoPreview from "./MuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "./VideoJSPreview";
import NativeVideoPreview from "./NativeVideoPreview";
import { isSafari } from "@/utils/videoUtils";
import JsonPreview from "./JsonPreview";
import RenderLinkPreview from "./RenderLinkPreview";
import { formatTime } from "@/utils";

interface CollectionFilePreviewProps {
  token: Message;
  onFileClick?: () => void;
}

function CollectionFilePreview({
  token,
  onFileClick,
}: CollectionFilePreviewProps) {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [modalPdf, setModalPdf] = useState({ pdfUrl: "", filename: "" });
  const [browserSupportsVideo, setBrowserSupportsVideo] = useState(false);

  useEffect(() => {
    const support = isSafari();
    setBrowserSupportsVideo(support);
  }, []);

  const openPdfModal = useCallback((pdfUrl: string, filename: string) => {
    setModalPdf({ pdfUrl, filename });
    setIsPdfModalOpen(true);
  }, []);

  const filename = token.content.name || token.cloudFrontDownloadLink || "";
  const getFileExtension = (name: string) =>
    name.split(".").pop()?.toLowerCase() || "";
  const fileExtension = getFileExtension(filename);

  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isPDF = /^pdf$/i.test(fileExtension);
  const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
  const isCSV = /^csv$/i.test(fileExtension);
  const isExcel = /^(xls|xlsx)$/i.test(fileExtension);
  const isJSON = /^json$/i.test(fileExtension);

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

  const fileUrl = isImage
    ? token.optimisedImageUrl
    : token.cloudFrontDownloadLink;
  const fileSize = formatFileSize(
    token.type === "REFERENCE" || token.type === "TIMESTAMP"
      ? token.content?.referencedAttachment?.size
      : token.metaData?.size
  );

  const thumbnailImage =
    token.content?.referencedAttachment?.thumbnailImage || "";
  const startTimestamp = formatTime(token.content.startTime || 0) || undefined;

  // Image Preview
  if (isImage && fileUrl) {
    const isHeic = fileExtension.toLowerCase() === "heic";
    return (
      <>
        <div
          className="w-full h-full object-cover rounded-2xl cursor-pointer relative group"
          onClick={() => {}}
        >
          <img
            src={fileUrl}
            alt={filename}
            className="w-full h-full object-cover rounded-2xl transition-opacity group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
        </div>

        <PDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          pdfUrl={modalPdf.pdfUrl}
          filename={modalPdf.filename}
        />
      </>
    );
  }

  // Video Preview
  if (isVideo && fileUrl) {
    const VIDEO_PLAYER_MODE =
      process.env.NEXT_PUBLIC_VIDEO_PLAYER_MODE || "native";

    let muxPlaybackId = null;
    if (token.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.muxDetailsForWebclient.muxPlaybackId;
    } else if (token.content?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.content.muxDetailsForWebclient.muxPlaybackId;
    } else if (
      token.content?.referencedAttachment?.muxDetailsForWebclient?.muxPlaybackId
    ) {
      muxPlaybackId =
        token.content.referencedAttachment.muxDetailsForWebclient.muxPlaybackId;
    }

    const videoWidth =
      token.content?.width || token.content?.referencedAttachment?.width;
    const videoHeight =
      token.content?.height || token.content?.referencedAttachment?.height;

    let videoComponent;
    if (VIDEO_PLAYER_MODE === "mux") {
      videoComponent = (
        <MuxVideoPreview
          muxPlaybackId={muxPlaybackId}
          fileUrl={fileUrl}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
          width={videoWidth}
          isFileSpecial
          height={videoHeight}
        />
      );
    } else if (VIDEO_PLAYER_MODE === "videojs") {
      if (muxPlaybackId) {
        videoComponent = (
          <MuxVideoJSPreview
            muxPlaybackId={muxPlaybackId}
            startTimestamp={startTimestamp}
            isFileSpecial
          />
        );
      } else {
        videoComponent = (
          <VanillaVideoJSPreview
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
            isFileSpecial
          />
        );
      }
    } else {
      videoComponent = (
        <NativeVideoPreview
          fileUrl={fileUrl}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
          isFileSpecial
        />
      );
    }

    return (
      <>
        <div className="w-full h-full relative">{videoComponent}</div>

        <PDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          pdfUrl={modalPdf.pdfUrl}
          filename={modalPdf.filename}
        />
      </>
    );
  }

  // Audio Preview
  if (isAudio && fileUrl) {
    return (
      <>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <BubbleAudioPlayer
            audioUrl={fileUrl}
            filename={filename}
            fileSize={fileSize}
            startTime={startTimestamp}
          />
        </div>

        <PDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          pdfUrl={modalPdf.pdfUrl}
          filename={modalPdf.filename}
        />
      </>
    );
  }

  // PDF Preview
  if (isPDF && fileUrl) {
    return (
      <>
        <div
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
          onClick={() => openPdfModal(fileUrl, filename)}
        >
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <span className="text-red-500 text-lg">📄</span>
          </div>
          <span className="text-xs text-gray-700 text-center px-2">
            {filename}
          </span>
        </div>

        <PDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          pdfUrl={modalPdf.pdfUrl}
          filename={modalPdf.filename}
        />
      </>
    );
  }

  // JSON Preview
  if (isJSON && fileUrl) {
    return (
      <>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <JsonPreview url={fileUrl} />
        </div>

        <PDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          pdfUrl={modalPdf.pdfUrl}
          filename={modalPdf.filename}
        />
      </>
    );
  }

  // Referenced Link Preview
  if (
    token.type === "REFERENCE" &&
    token.content?.referencedAttachment?.url &&
    !isImage &&
    !isVideo &&
    !isAudio &&
    !isPDF &&
    !isZip &&
    !isCSV &&
    !isExcel
  ) {
    const getDisplayUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        return { hostname: parsed.hostname, origin: parsed.origin };
      } catch (error) {
        return { hostname: "", origin: "" };
      }
    };

    return (
      <>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <RenderLinkPreview
            getDisplayUrl={getDisplayUrl}
            token={{
              ...token,
              content: {
                ...token.content,
                url: token.content.referencedAttachment.url,
              },
            }}
            setFaviconError={() => {}}
            faviconError={false}
            openImageModal={() => {}}
          />
        </div>

        <PDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          pdfUrl={modalPdf.pdfUrl}
          filename={modalPdf.filename}
        />
      </>
    );
  }

  // Other file types
  const getFileIcon = () => {
    if (isZip) return "📦";
    if (isCSV) return "📊";
    if (isExcel) return "📈";
    return "📄";
  };

  const getFileTitle = () => {
    if (isZip) return "Archive";
    if (isCSV) return "CSV";
    if (isExcel) return "Excel";
    return "File";
  };

  const getFileColor = () => {
    if (isZip) return "text-amber-500";
    if (isCSV) return "text-green-500";
    if (isExcel) return "text-emerald-500";
    return "text-gray-500";
  };

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <span className={`text-lg ${getFileColor()}`}>{getFileIcon()}</span>
        </div>
        <span className="text-xs text-gray-700 text-center px-2">
          {filename}
        </span>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 bg-transparent border border-solid border-[#1919191A] text-xs text-[#191919] px-2 py-1 rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            Open {getFileTitle()}
          </a>
        )}
      </div>

      <PDFModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={modalPdf.pdfUrl}
        filename={modalPdf.filename}
      />
    </>
  );
}

export default CollectionFilePreview;
