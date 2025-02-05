import { parseTimestamp } from "@/utils";
import AudioPlayer from "./AudioPlayer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { ScrollMode } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useEffect, useRef, useState } from "react";

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android")
  );
};

function RenderFilePreview({
  url,
  formatFileSize,
  token,
  isImage,
  openImageModal,
  filename,
  isVideo,
  fileExtension,
  isAudio,
  isPDF,
  isZip,
  isCSV,
  isExcel,
  thumbnailImage,
  startTimestamp,
}: {
  url: string | undefined;
  formatFileSize: (bytes?: number) => string;
  token: any;
  isImage: boolean;
  openImageModal: (url: string, alt: string) => void;
  filename: string;
  isVideo: boolean;
  fileExtension: string;
  isAudio: boolean;
  isPDF: boolean;
  isZip: boolean;
  isCSV: boolean;
  isExcel: boolean;
  thumbnailImage: string;
  startTimestamp?: string;
}) {
  const fileUrl = url;
  const fileSize = formatFileSize(token.content?.size);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [browserSupportsVideo, setBrowserSupportsVideo] = useState(false);
  console.log(fileExtension, "fileExtension");

  useEffect(() => {
    setBrowserSupportsVideo(isSafari());
  }, []);

  // Image Preview with animation
  if (isImage && url) {
    const isHeic = fileExtension.toLowerCase() === "heic";
    if (isHeic) {
      return (
        <>
          {browserSupportsVideo ? (
            <div
              className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px] cursor-pointer relative group"
              onClick={() => openImageModal(url, filename)}
            >
              <img
                src={url}
                alt={filename}
                width={500}
                height={500}
                className="w-full h-auto transition-opacity group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
            </div>
          ) : (
            <div className="space-y-1 p-4">
              <h2 className="text-primary text-[15px] font-medium">
                Typo URLs are in beta
              </h2>
              <p className="text-xs text-[#7E7E7E]">
                Currently, this file is only supported on Safari
              </p>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div
          className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px] cursor-pointer relative group"
          onClick={() => openImageModal(url, filename)}
        >
          <img
            src={url}
            alt={filename}
            width={500}
            height={500}
            className="w-full h-auto transition-opacity group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
        </div>
      );
    }
  }

  // Video Preview with animation
  if (isVideo && fileUrl) {
    useEffect(() => {
      if (startTimestamp && videoRef.current) {
        const startSeconds = parseTimestamp(startTimestamp);
        videoRef.current.currentTime = startSeconds;
      }
    }, [startTimestamp]);

    const getVideoMimeType = (extension: string) => {
      const extensionToMimeType: { [key: string]: string } = {
        mp4: "video/mp4",
        webm: "video/webm",
        ogg: "video/ogg",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        MOV: "video/quicktime",
      };
      return extensionToMimeType[extension] || `video/${extension}`;
    };

    return (
      <div className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px]">
        <video
          ref={videoRef}
          poster={thumbnailImage}
          controls
          className="w-full h-auto"
          onLoadedMetadata={() => {
            if (startTimestamp && videoRef.current) {
              const startSeconds = parseTimestamp(startTimestamp);
              videoRef.current.currentTime = startSeconds;
            }
          }}
        >
          <source src={fileUrl} type={getVideoMimeType(fileExtension)} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Audio Preview with animation
  if (isAudio && fileUrl) {
    return (
      <AudioPlayer
        audioUrl={fileUrl}
        filename={filename}
        fileSize={fileSize}
        startTime={startTimestamp}
      />
    );
  }

  // PDF Preview with animation
  if (isPDF && fileUrl) {
    return (
      <div className="rounded-[14px] max-w-xs w-full overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-[350px]">
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.PageWidth}
              scrollMode={ScrollMode.Page}
            />
          </div>
        </Worker>
      </div>
    );
  }

  // For other file types with animation
  const getPreviewBox = (icon: string, title: string, color: string) => (
    <div className="flex max-w-xs w-full p-3 flex-col gap-3 rounded-[14px] bg-white border border-solid border-[#1919191a]">
      <div className="flex justify-between items-center self-stretch gap-3">
        <div className="flex justify-between items-center self-stretch gap-3 flex-nowrap">
          <div className="w-6 h-6 rounded border border-solid border-[#1919191a] flex items-center justify-center">
            <span className="text-base">{icon}</span>
          </div>
          <div
            className={`inline-block items-center gap-1.5 text-xs font-medium ${color} whitespace-nowrap max-w-[137px] truncate overflow-hidden`}
          >
            {filename}
          </div>
        </div>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border border-solid border-[#1919191A] text-xs text-[#191919] px-2 py-1 rounded-full"
          >
            Open {title}
          </a>
        )}
      </div>
      <div className="inline-block self-stretch text-[#7e7e7e] max-w-xs truncate overflow-hidden text-sm">
        {fileSize && `File size: ${fileSize}`}
      </div>
    </div>
  );

  if (isZip) return getPreviewBox("📦", "Archive", "text-amber-500");
  if (isCSV) return getPreviewBox("📊", "CSV", "text-green-500");
  if (isExcel) return getPreviewBox("📑", "Excel", "text-emerald-500");

  return (
    <div className="space-y-1 p-4">
      <h2 className="text-primary text-[15px] font-medium">
        Typo URLs are in beta
      </h2>
      <p className="text-xs text-[#7E7E7E]">
        Currently, this file type is not supported
      </p>
    </div>
  );
}

export default RenderFilePreview;
