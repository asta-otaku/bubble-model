import BubbleAudioPlayer from "./BubbleAudioPlayer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { ScrollMode } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import RenderLinkPreview from "./RenderLinkPreview";
import MuxVideoPreview from "./MuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "./VideoJSPreview";
import NativeVideoPreview from "./NativeVideoPreview";
import JsonPreview from "./JsonPreview";
import { formatTime } from "@/utils";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import React from "react";

interface UniversalFilePreviewProps {
  token: Message;
  fileData?: any;
  disableModals?: boolean;
  onImageClick?: (url: string, alt: string) => void;
  onPdfClick?: (url: string, filename: string) => void;
}

const UniversalFilePreview: React.FC<UniversalFilePreviewProps> = ({
  token,
  disableModals = false,
  onImageClick,
  onPdfClick,
}) => {
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
    if (VIDEO_PLAYER_MODE === "mux") {
      return (
        <MuxVideoPreview
          muxPlaybackId={muxPlaybackId}
          fileUrl={fileUrl}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
          width={videoWidth}
          height={videoHeight}
        />
      );
    } else if (VIDEO_PLAYER_MODE === "videojs") {
      if (muxPlaybackId) {
        return (
          <MuxVideoJSPreview
            muxPlaybackId={muxPlaybackId}
            startTimestamp={startTimestamp}
          />
        );
      } else {
        return (
          <VanillaVideoJSPreview
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
          />
        );
      }
    } else {
      return (
        <NativeVideoPreview
          fileUrl={fileUrl}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
        />
      );
    }
  }
  // Audio
  if (isAudio && fileUrl) {
    return (
      <BubbleAudioPlayer
        audioUrl={fileUrl}
        filename={filename}
        fileSize={fileSize}
        startTime={startTimestamp}
        isBubbleSpecial={true}
      />
    );
  }
  // PDF
  if (isPDF && fileUrl) {
    return (
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
            defaultScale={SpecialZoomLevel.PageWidth}
            scrollMode={ScrollMode.Page}
          />
        </div>
      </Worker>
    );
  }
  // JSON
  if (isJSON && fileUrl) {
    return <JsonPreview url={fileUrl} />;
  }
  // Link Preview
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
    );
  }
  // Other file types
  const getFileIcon = () => {
    if (isZip) return "📦";
    if (isCSV) return "📊";
    if (isExcel) return "📈";
    if (isJSON) return "📋";
    return "📄";
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
        <span className="text-gray-500 text-lg">{getFileIcon()}</span>
      </div>
      <span className="text-xs text-gray-700 text-center px-2">{filename}</span>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 bg-transparent border border-solid border-[#1919191A] text-xs text-[#191919] px-2 py-1 rounded-full"
        >
          Open File
        </a>
      )}
    </div>
  );
};

export default UniversalFilePreview;
