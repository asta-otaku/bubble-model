import AudioPlayer from "./AudioPlayer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { ScrollMode } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import RenderLinkPreview from "./RenderLinkPreview";
import FileMuxVideoPreview from "./FileMuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "./VideoJSPreview";
import NativeVideoPreview from "./NativeVideoPreview";
import JsonPreview from "./JsonPreview";
import { formatTime } from "@/utils";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import React from "react";

interface CollectionFileModalPreviewProps {
  token: Message;
  disableModals?: boolean;
  onImageClick?: (url: string, alt: string) => void;
  onPdfClick?: (url: string, filename: string) => void;
}

const CollectionFileModalPreview: React.FC<CollectionFileModalPreviewProps> = ({
  token,
  disableModals = false,
  onImageClick,
  onPdfClick,
}) => {
  const filename = token.content.name || token.cloudFrontDownloadLink || "";
  const getFileExtension = (name: string) =>
    name.split(".").pop()?.toLowerCase() || "";
  const fileExtension = getFileExtension(filename);
  const isLink = token.type === "LINK" && token.content.url;
  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isPDF = /^pdf$/i.test(fileExtension);
  const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
  const isCSV = /^csv$/i.test(fileExtension);
  const isExcel = /^(xls|xlsx)$/i.test(fileExtension);
  const isJSON = /^json$/i.test(fileExtension);
  const fileUrl = isImage
    ? token.optimisedImageUrl
    : token.cloudFrontDownloadLink;
  const fileSize = (() => {
    const bytes =
      token.type === "REFERENCE" || token.type === "TIMESTAMP"
        ? token.content?.referencedAttachment?.size
        : token.metaData?.size;
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  })();
  const thumbnailImage =
    token.content?.referencedAttachment?.thumbnailImage || "";
  const startTimestamp = formatTime(token.content.startTime || 0) || undefined;

  // Image
  if (isImage && fileUrl) {
    return (
      <img
        src={fileUrl}
        alt={filename}
        className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl cursor-pointer"
        loading="eager"
        onClick={
          disableModals && onImageClick
            ? () => onImageClick(fileUrl, filename)
            : undefined
        }
      />
    );
  }

  // Video
  if (isVideo && fileUrl) {
    const VIDEO_PLAYER_MODE =
      process.env.NEXT_PUBLIC_VIDEO_PLAYER_MODE || "native";

    // Handle different data structures coming into this component
    let muxPlaybackId = null;

    // Case 1: token is an attachment object from the attachments array (most common case)
    if (token?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.muxDetailsForWebclient.muxPlaybackId;
    }
    // Case 2: token is a normal message with content property
    else if (token.content?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.content.muxDetailsForWebclient.muxPlaybackId;
    }
    // Case 3: token is a reference with nested content
    else if (
      token.content?.referencedAttachment?.muxDetailsForWebclient?.muxPlaybackId
    ) {
      muxPlaybackId =
        token.content.referencedAttachment.muxDetailsForWebclient.muxPlaybackId;
    }
    if (VIDEO_PLAYER_MODE === "mux") {
      return (
        <div className="w-full h-[85vh] flex flex-col items-center justify-center">
          <FileMuxVideoPreview
            muxPlaybackId={muxPlaybackId}
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
            isFileSpecial={true}
          />
        </div>
      );
    } else if (VIDEO_PLAYER_MODE === "videojs") {
      if (muxPlaybackId) {
        return (
          <div className="w-full h-[85vh] flex flex-col items-center justify-center">
            <MuxVideoJSPreview
              muxPlaybackId={muxPlaybackId}
              startTimestamp={startTimestamp}
              isFileSpecial={true}
            />
          </div>
        );
      } else {
        return (
          <div className="w-full h-[85vh] flex flex-col items-center justify-center">
            <VanillaVideoJSPreview
              fileUrl={fileUrl}
              fileExtension={fileExtension}
              thumbnailImage={thumbnailImage}
              startTimestamp={startTimestamp}
              isFileSpecial={true}
            />
          </div>
        );
      }
    } else {
      // Default to native mode
      return (
        <div className="w-full h-[85vh] flex flex-col items-center justify-center">
          <NativeVideoPreview
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
            isFileSpecial={true}
          />
        </div>
      );
    }
  }

  // Audio
  if (isAudio && fileUrl) {
    return (
      <div className="w-full h-[85vh] flex flex-col items-center justify-center">
        <AudioPlayer
          audioUrl={fileUrl}
          filename={""}
          fileSize={""}
          startTime={startTimestamp}
          isFileSpecial={true}
          isBubbleSpecial={false}
        />
      </div>
    );
  }

  // PDF
  if (isPDF && fileUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div
            className="h-[80vh] relative group w-full flex items-center justify-center cursor-pointer"
            onClick={
              disableModals && onPdfClick
                ? () => onPdfClick(fileUrl, filename)
                : undefined
            }
          >
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.PageFit}
              scrollMode={ScrollMode.Vertical}
            />
          </div>
        </Worker>
      </div>
    );
  }

  // JSON
  if (isJSON && fileUrl) {
    return <JsonPreview url={fileUrl} />;
  }

  // Link Preview
  if (isLink) {
    const getDisplayUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        return { hostname: parsed.hostname, origin: parsed.origin };
      } catch (error) {
        return { hostname: "", origin: "" };
      }
    };

    return (
      <div className="w-full h-[85vh] flex flex-col items-center justify-center">
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
          openImageModal={onImageClick || (() => {})}
        />
      </div>
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
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className={`text-2xl ${getFileColor()}`}>{getFileIcon()}</span>
      </div>
      <span className="text-sm text-gray-700 text-center px-4 mb-4">
        {filename}
      </span>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-transparent border border-solid border-[#1919191A] text-sm text-[#191919] px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Open {getFileTitle()}
        </a>
      )}
    </div>
  );
};

export default CollectionFileModalPreview;
