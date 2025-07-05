import { useState, useCallback } from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import PDFModal from "./PdfModal";
import BubbleAudioPlayer from "./BubbleAudioPlayer";
import MuxVideoPreview from "./MuxVideoPreview";
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

  if (isImage && fileUrl) {
    return (
      <>
        <div
          className="w-full h-full object-cover rounded-2xl cursor-pointer"
          onClick={onFileClick}
        >
          <img
            src={fileUrl}
            alt={filename}
            className="w-full h-full object-cover rounded-2xl"
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

  if (isVideo && fileUrl) {
    const muxPlaybackId =
      token.muxDetailsForWebclient?.muxPlaybackId ||
      token.content?.muxDetailsForWebclient?.muxPlaybackId ||
      token.content?.referencedAttachment?.muxDetailsForWebclient
        ?.muxPlaybackId;

    const videoWidth =
      token.content?.width || token.content?.referencedAttachment?.width;
    const videoHeight =
      token.content?.height || token.content?.referencedAttachment?.height;

    return (
      <>
        <div className="w-full h-full relative">
          <MuxVideoPreview
            muxPlaybackId={muxPlaybackId}
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={
              token.content.referencedAttachment?.thumbnailImage || ""
            }
            startTimestamp={
              formatTime(token.content.startTime || 0) || undefined
            }
            width={videoWidth}
            height={videoHeight}
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

  if (isAudio && fileUrl) {
    return (
      <>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <BubbleAudioPlayer
            audioUrl={fileUrl}
            filename={filename}
            fileSize={fileSize}
            startTime={formatTime(token.content.startTime || 0) || undefined}
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

  const getFileIcon = () => {
    if (isZip) return "📦";
    if (isCSV) return "📊";
    if (isExcel) return "📈";
    if (isJSON) return "📋";
    return "📄";
  };

  return (
    <>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-gray-500 text-lg">{getFileIcon()}</span>
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

export default CollectionFilePreview;
