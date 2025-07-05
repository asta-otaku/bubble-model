import BubbleAudioPlayer from "./BubbleAudioPlayer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { ScrollMode } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useEffect, useRef, useState } from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import RenderLinkPreview from "./RenderLinkPreview";
import MuxVideoPreview from "./MuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "./VideoJSPreview";
import NativeVideoPreview from "./NativeVideoPreview";
import { isSafari } from "@/utils/videoUtils";
import JsonPreview from "./JsonPreview";
import { FileData } from "@/utils/BubbleSpecialInterfaces";

function RenderFilePreview({
  url,
  formatFileSize,
  token,
  fileData,
  isImage,
  openImageModal,
  openPdfModal,
  filename,
  isVideo,
  fileExtension,
  isAudio,
  isPDF,
  isZip,
  isCSV,
  isExcel,
  isJSON,
  thumbnailImage,
  startTimestamp,
}: {
  url: string | undefined;
  formatFileSize: (bytes?: number) => string;
  token: Message;
  fileData?: FileData;
  isImage: boolean;
  openImageModal: (url: string, alt: string) => void;
  openPdfModal: (pdfUrl: string, filename: string) => void;
  filename: string;
  isVideo: boolean;
  fileExtension: string;
  isAudio: boolean;
  isPDF: boolean;
  isZip: boolean;
  isCSV: boolean;
  isExcel: boolean;
  isJSON: boolean;
  thumbnailImage: string;
  startTimestamp?: string;
}) {
  console.log("[RenderFilePreview] Rendering with props:", {
    filename,
    fileExtension,
    isImage,
    isVideo,
    isAudio,
    isPDF,
    isZip,
    isCSV,
    isExcel,
    isJSON,
    hasThumbnail: !!thumbnailImage,
    hasStartTimestamp: !!startTimestamp,
  });

  // Use optimisedImageUrl for images, cloudFrontDownloadLink for all other file types
  const fileUrl = isImage
    ? token.optimisedImageUrl
    : token.cloudFrontDownloadLink;
  const fileSize = formatFileSize(
    token.type === "REFERENCE" || token.type === "TIMESTAMP"
      ? token.content?.referencedAttachment?.size
      : token.metaData?.size
  );
  const [browserSupportsVideo, setBrowserSupportsVideo] = useState(false);

  useEffect(() => {
    console.log("[RenderFilePreview] Checking browser video support");
    const support = isSafari();
    console.log("[RenderFilePreview] Browser video support:", support);
    setBrowserSupportsVideo(support);
  }, []);

  // Image Preview with animation
  if (isImage && fileUrl) {
    const isHeic = fileExtension.toLowerCase() === "heic";
    if (isHeic) {
      console.log("[RenderFilePreview] Rendering HEIC image");
      return (
        <div
          className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px] cursor-pointer relative group"
          onClick={() => {
            console.log("[RenderFilePreview] Opening HEIC image modal");
            openImageModal(fileUrl, filename);
          }}
        >
          <img
            src={fileUrl}
            alt={filename}
            width={500}
            height={500}
            className="w-full h-auto transition-opacity group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
        </div>
      );
    } else {
      console.log("[RenderFilePreview] Rendering standard image");
      return (
        <div
          className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px] cursor-pointer relative group"
          onClick={() => {
            console.log("[RenderFilePreview] Opening image modal");
            openImageModal(fileUrl, filename);
          }}
        >
          <img
            src={fileUrl}
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

  // Video Preview
  if (isVideo && fileUrl) {
    console.log("[RenderFilePreview] Rendering video preview");
    const VIDEO_PLAYER_MODE =
      process.env.NEXT_PUBLIC_VIDEO_PLAYER_MODE || "native";
    console.log("[RenderFilePreview] Video player mode:", VIDEO_PLAYER_MODE);

    let muxPlaybackId = null;
    // The token is an attachment object from the attachments array
    if (token.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.muxDetailsForWebclient.muxPlaybackId;
    } else if (
      fileData?.textAttachment?.attachedContent?.muxDetailsForWebclient
        ?.muxPlaybackId
    ) {
      muxPlaybackId =
        fileData.textAttachment.attachedContent.muxDetailsForWebclient
          .muxPlaybackId;
    } else if (token.content?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.content.muxDetailsForWebclient.muxPlaybackId;
    } else if (
      token.content?.referencedAttachment?.muxDetailsForWebclient?.muxPlaybackId
    ) {
      muxPlaybackId =
        token.content.referencedAttachment.muxDetailsForWebclient.muxPlaybackId;
    }

    console.log("[RenderFilePreview] Mux playback ID:", muxPlaybackId);

    const videoWidth =
      token.content?.width || token.content?.referencedAttachment?.width;
    const videoHeight =
      token.content?.height || token.content?.referencedAttachment?.height;
    console.log("[RenderFilePreview] Video dimensions:", {
      width: videoWidth,
      height: videoHeight,
    });

    if (VIDEO_PLAYER_MODE === "mux") {
      console.log("[RenderFilePreview] Using Mux video player");
      return (
        <MuxVideoPreview
          muxPlaybackId={muxPlaybackId}
          fileUrl={fileUrl || fileData?.textAttachment.cloudFrontDownloadLink}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
          width={videoWidth}
          height={videoHeight}
        />
      );
    } else if (VIDEO_PLAYER_MODE === "videojs") {
      console.log("[RenderFilePreview] Using Video.js player");
      if (muxPlaybackId) {
        console.log("[RenderFilePreview] Using Mux Video.js player");
        return (
          <MuxVideoJSPreview
            muxPlaybackId={muxPlaybackId}
            startTimestamp={startTimestamp}
          />
        );
      } else {
        console.log("[RenderFilePreview] Using Vanilla Video.js player");
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
      console.log("[RenderFilePreview] Using native video player");
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

  // Audio Preview with animation
  if (isAudio && fileUrl) {
    console.log("[RenderFilePreview] Rendering audio player");
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

  // PDF Preview with animation
  if (isPDF && fileUrl) {
    console.log("[RenderFilePreview] Rendering PDF preview");
    return (
      <>
        <div
          className="rounded-[14px] max-w-xs w-full overflow-hidden cursor-pointer"
          onClick={() => {
            console.log("[RenderFilePreview] Opening PDF modal");
            openPdfModal(fileUrl, filename);
          }}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="h-[360px] relative group">
              <Viewer
                fileUrl={fileUrl}
                defaultScale={SpecialZoomLevel.PageWidth}
                scrollMode={ScrollMode.Page}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg pointer-events-none" />
            </div>
          </Worker>
        </div>
      </>
    );
  }

  if (isJSON && fileUrl) {
    console.log("[RenderFilePreview] Rendering JSON preview");
    return <JsonPreview url={fileUrl} />;
  }

  // *** New: Referenced Link Preview ***
  // If the token is a REFERENCE but not any supported media type,
  // display a link preview.
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
    // Helper function to parse the URL and extract hostname/origin
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
          // Ensure token.content.url is populated using the referencedAttachment URL
          content: {
            ...token.content,
            url: token.content.referencedAttachment.url,
          },
        }}
        setFaviconError={() => {}}
        faviconError={false}
        openImageModal={openImageModal}
      />
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
