import { Message } from "@/utils/BubbleSpecialInterfaces";
import MuxVideoPreview from "./MuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "./VideoJSPreview";
import NativeVideoPreview from "./NativeVideoPreview";
import JsonPreview from "./JsonPreview";
import RenderLinkPreview from "./RenderLinkPreview";
import audioThumbnail from "@/assets/audioThumbnail.svg";
import docThumbnail from "@/assets/docThumbnail.svg";
import linkThumbnail from "@/assets/linkThumbnail.svg";
import { formatTime } from "@/utils";
import { ScrollMode, SpecialZoomLevel, Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";

interface CollectionFilePreviewProps {
  token: Message;
  onFileClick?: () => void;
}

function CollectionFilePreview({
  token,
  onFileClick,
}: CollectionFilePreviewProps) {
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
      </>
    );
  }

  // Audio Preview
  if (isAudio && fileUrl) {
    return (
      <img
        src={audioThumbnail.src}
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
    return (
      <>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <JsonPreview url={fileUrl} />
        </div>
      </>
    );
  }

  // Referenced Link Preview
  if (isLink) {
    return (
      <img
        src={linkThumbnail.src}
        alt="Link"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <img
      src={docThumbnail.src}
      alt="Document"
      className="w-full h-full object-cover"
    />
  );
}

export default CollectionFilePreview;
