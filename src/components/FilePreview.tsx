import AudioPlayer from "./AudioPlayer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { ScrollMode } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useEffect, useState } from "react";
import RenderLinkPreview from "./RenderLinkPreview";
import FileMuxVideoPreview from "./FileMuxVideoPreview";
import MuxVideoJSPreview, { VanillaVideoJSPreview } from "./VideoJSPreview";
import NativeVideoPreview from "./NativeVideoPreview";
import { isSafari } from "@/utils/videoUtils";
import JsonPreview from "./JsonPreview";
import genericdoc from "@/assets/genericdoc.svg";
import downloadIcon from "@/assets/download.svg";
import Image from "next/image";
import { FileData, Message } from "@/utils/BubbleSpecialInterfaces";

function FilePreview({
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
  isJSON,
  isExcel,
  thumbnailImage,
  startTimestamp,
  title,
  optimisedImageUrl,
}: {
  url: string | undefined;
  formatFileSize: (bytes?: number) => string;
  token: any;
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
  title: string;
  optimisedImageUrl?: string;
}) {
  const fileUrl = url;

  const [browserSupportsVideo, setBrowserSupportsVideo] = useState(false);

  useEffect(() => {
    setBrowserSupportsVideo(isSafari());
  }, []);

  // Image Preview with animation
  if (isImage && url) {
    // Get the best available image URL
    const imageToDisplay = optimisedImageUrl || url;
    // Add logs to see which image is being displayed
    console.log("Original URL:", url);
    console.log("Optimised URL:", optimisedImageUrl);
    console.log("Image being displayed:", imageToDisplay);

    const [imgError, setImgError] = useState(false);

    const isHeic =
      fileExtension.toLowerCase() === "heic" ||
      fileExtension.toLowerCase() === "tif";
    if (isHeic) {
      return (
        <>
          {browserSupportsVideo ? (
            <div
              className="w-full overflow-hidden cursor-pointer relative group"
              onClick={() => openImageModal(imageToDisplay, filename)}
            >
              <img
                src={imageToDisplay}
                alt={filename}
                className="w-full h-full transition-opacity object-contain"
                onError={(e) => {
                  console.log("Image failed to load:", imageToDisplay);
                  if (optimisedImageUrl && !imgError) {
                    console.log("Falling back to original image:", url);
                    setImgError(true);
                    e.currentTarget.src = url;
                  }
                }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors rounded-lg" />
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
          className="w-full h-full overflow-hidden cursor-pointer relative group"
          onClick={() =>
            openImageModal(imgError ? url : imageToDisplay, filename)
          }
        >
          {process.env.NODE_ENV === "development" && (
            <div className="absolute top-0 left-0 bg-black/80 text-white text-xs p-1 z-10">
              Using:{" "}
              {imgError
                ? "Original (fallback)"
                : optimisedImageUrl
                ? "Optimised"
                : "Original"}
            </div>
          )}
          <img
            src={imageToDisplay}
            alt={filename}
            className="w-full h-full transition-opacity object-contain"
            onError={(e) => {
              console.log("Image failed to load:", imageToDisplay);
              if (optimisedImageUrl && !imgError) {
                console.log("Falling back to original image:", url);
                setImgError(true);
                e.currentTarget.src = url;
              }
            }}
            loading="lazy"
          />
        </div>
      );
    }
  }

  // Video Preview
  if (isVideo && fileUrl) {
    const VIDEO_PLAYER_MODE =
      process.env.NEXT_PUBLIC_VIDEO_PLAYER_MODE || "native";
    console.log("VIDEO_PLAYER_MODE FilePreview:", VIDEO_PLAYER_MODE);
    console.log("token debugging FilePreview:", token);
    console.log("fileData debugging FilePreview:", fileData);

    // Handle different data structures coming into this component
    let muxPlaybackId = null;

    // Case 1: token is an attachment object from the attachments array (most common case)
    if (token?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.muxDetailsForWebclient.muxPlaybackId;
    }
    // Case 2: fileData structure passed from file-special page
    else if (
      fileData?.textAttachment?.attachedContent?.muxDetailsForWebclient
        ?.muxPlaybackId
    ) {
      muxPlaybackId =
        fileData.textAttachment.attachedContent.muxDetailsForWebclient
          .muxPlaybackId;
    }
    // Case 3: token is actually the textAttachment itself (from file-special)
    else if (token?.attachedContent?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId =
        token.attachedContent.muxDetailsForWebclient.muxPlaybackId;
    }
    // Case 4: token is a normal message with content property
    else if (token.content?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = token.content.muxDetailsForWebclient.muxPlaybackId;
    }
    // Case 5: token is a reference with nested content
    else if (
      token.content?.referencedAttachment?.muxDetailsForWebclient?.muxPlaybackId
    ) {
      muxPlaybackId =
        token.content.referencedAttachment.muxDetailsForWebclient.muxPlaybackId;
    }
    console.log("muxPlaybackId FilePreview:", muxPlaybackId);

    if (VIDEO_PLAYER_MODE === "mux") {
      return (
        <FileMuxVideoPreview
          muxPlaybackId={muxPlaybackId}
          fileUrl={fileUrl || fileData?.textAttachment.cloudFrontDownloadLink}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
          isFileSpecial={true}
        />
      );
    } else if (VIDEO_PLAYER_MODE === "videojs") {
      if (muxPlaybackId) {
        return (
          <MuxVideoJSPreview
            muxPlaybackId={muxPlaybackId}
            startTimestamp={startTimestamp}
            isFileSpecial={true}
          />
        );
      } else {
        return (
          <VanillaVideoJSPreview
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
            isFileSpecial={true}
          />
        );
      }
    } else {
      // Default to native mode
      return (
        <NativeVideoPreview
          fileUrl={fileUrl}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
          isFileSpecial={true}
        />
      );
    }
  }

  // Audio Preview with animation
  if (isAudio && fileUrl) {
    return (
      <AudioPlayer
        audioUrl={fileUrl}
        filename={""}
        fileSize={""}
        startTime={startTimestamp}
        isFileSpecial
        isBubbleSpecial={false}
      />
    );
  }

  // PDF Preview with animation
  if (isPDF && fileUrl) {
    return (
      <>
        <div
          className="w-full overflow-hidden cursor-pointer"
          onClick={() => openPdfModal(fileUrl, filename)}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="h-full relative group">
              <Viewer
                fileUrl={fileUrl}
                defaultScale={SpecialZoomLevel.PageFit}
                scrollMode={ScrollMode.Vertical}
              />
            </div>
          </Worker>
        </div>
      </>
    );
  }

  if (isJSON && fileUrl) {
    return <JsonPreview url={fileUrl} />;
  }

  // *** New: Referenced Link Preview ***
  // If the token is a REFERENCE but not any supported media type,
  // display a link preview.
  if (
    token?.type === "REFERENCE" &&
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
  const getPreviewBox = () => (
    <div className="flex w-full p-3 flex-col gap-3 items-center justify-center">
      <div className="max-w-sm space-y-3 w-full mx-auto bg-[#F3F3F3] rounded-3xl p-4 border">
        <div>
          <h2
            className={`inline-block items-center gap-1.5 text-[17px] text-primary font-medium line-clamp-1`}
          >
            {title}
          </h2>
          <p className="text-xs text-[#7E7E7E] -mt-3">
            {formatFileSize(token.metaData?.size)}
          </p>
        </div>
        <div className="flex justify-center w-full">
          <Image
            src={genericdoc}
            alt="Generic Document"
            className="w-16 h-16 object-contain"
          />
        </div>
        {fileUrl && (
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-[#3076FF] to-[#1D49E5] border border-solid border-[#1919191A] font-medium text-sm text-white px-4 py-3 rounded-full w-full flex justify-center items-center gap-3 hover:bg-[#1D49E5] transition-colors duration-200 ease-in-out"
          >
            <Image
              src={downloadIcon}
              alt="Download"
              className="w-4 h-4 object-contain"
            />
            Download to view
          </a>
        )}
      </div>
    </div>
  );

  if (isZip) return getPreviewBox();
  if (isCSV) return getPreviewBox();
  if (isExcel) return getPreviewBox();

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

export default FilePreview;
