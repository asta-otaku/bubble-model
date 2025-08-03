import React, { useMemo } from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { getFileType, getFileExtension } from "@/utils/fileTypeUtils";
import { ThumbnailService } from "@/utils/thumbnailService";
import MuxVideoPreview from "../MuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "../VideoJSPreview";
import NativeVideoPreview from "../NativeVideoPreview";
import JsonPreview from "../JsonPreview";
import { formatTime } from "@/utils";
import { ScrollMode, SpecialZoomLevel, Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";

interface CollectionFilePreviewProps {
  token: Message;
  onFileClick?: () => void;
}

function CollectionFilePreview({ token }: CollectionFilePreviewProps) {
  // Memoize expensive computations
  const fileData = useMemo(() => {
    const filename = token.content?.name || token.cloudFrontDownloadLink || "";
    const fileType = getFileType(token);
    const isLink = fileType === "link";
    const isImage = fileType === "image";
    const isVideo = fileType === "video";
    const isAudio = fileType === "audio";
    const isPDF = fileType === "pdf";
    const isJSON = fileType === "json";

    const fileUrl = isImage
      ? token.optimisedImageUrl
      : token.cloudFrontDownloadLink;

    const thumbnailImage =
      token.content?.referencedAttachment?.thumbnailImage || "";
    const startTimestamp =
      formatTime(token.content?.startTime || 0) || undefined;

    return {
      filename,
      fileType,
      isLink,
      isImage,
      isVideo,
      isAudio,
      isPDF,
      isJSON,
      fileUrl,
      thumbnailImage,
      startTimestamp,
    };
  }, [token]);

  const {
    filename,
    fileType,
    isLink,
    isImage,
    isVideo,
    isAudio,
    isPDF,
    isJSON,
    fileUrl,
    thumbnailImage,
    startTimestamp,
  } = fileData;

  // Image Preview
  if (isImage && fileUrl) {
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
    try {
      if (VIDEO_PLAYER_MODE === "mux") {
        videoComponent = (
          <MuxVideoPreview
            muxPlaybackId={muxPlaybackId}
            fileUrl={fileUrl}
            fileExtension={getFileExtension(filename)}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
            width={videoWidth}
            isFileSpecial
            showPlayButtonOnly
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
              fileExtension={getFileExtension(filename)}
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
            fileExtension={getFileExtension(filename)}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
            isFileSpecial
          />
        );
      }
    } catch (error) {
      console.error("Error rendering video component:", error);
      videoComponent = (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-sm">Video preview unavailable</p>
        </div>
      );
    }

    return (
      <>
        <div className="w-full h-full relative">{videoComponent}</div>
      </>
    );
  }

  // Audio Preview
  if (isAudio && fileUrl) {
    return (
      <img
        src={ThumbnailService.getFileThumbnail(token)}
        alt="Audio"
        className="w-full h-full object-cover"
      />
    );
  }

  // PDF Preview
  if (isPDF && fileUrl) {
    return (
      <div className="w-full overflow-hidden cursor-pointer h-full object-cover">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-full w-full object-cover relative group">
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.ActualSize}
              scrollMode={ScrollMode.Page}
            />
          </div>
        </Worker>
      </div>
    );
  }

  // JSON Preview
  if (isJSON && fileUrl) {
    try {
      return (
        <>
          <div className="w-full h-full flex flex-col items-center justify-center">
            <JsonPreview url={fileUrl} />
          </div>
        </>
      );
    } catch (error) {
      console.error("Error rendering JSON preview:", error);
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-sm">JSON preview unavailable</p>
        </div>
      );
    }
  }

  // Referenced Link Preview
  if (isLink) {
    return (
      <img
        src={ThumbnailService.getFileThumbnail(token)}
        alt="Link"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <img
      src={ThumbnailService.getFileThumbnail(token)}
      alt="Document"
      className="w-full h-full object-cover"
    />
  );
}

export default CollectionFilePreview;
