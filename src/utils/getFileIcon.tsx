import imageIcon from "../assets/imageIcon.svg";
import audioIcon from "../assets/musicIcon.svg";
import blueAudio from "../assets/blueMusicIcon.svg";
import links from "../assets/chain.svg";
import whitelinks from "../assets/whitechain.svg";
import whitestamp from "../assets/whitestamp.svg";
import bluestamp from "../assets/bluestamp.svg";
import whitereference from "../assets/whitereference.svg";
import bluereference from "../assets/bluereference.svg";
import whitevideo from "../assets/whitevideo.svg";
import bluevideo from "../assets/bluevideo.svg";
import { Message } from "./BubbleSpecialInterfaces";
import Image from "next/image";
import { formatTime } from ".";

export const getFileIcon = (
  attachment: Message,
  selectedAttachment: Message | null,
  transitioning: boolean
) => {
  const fileExtension =
    attachment.cloudFrontDownloadLink?.split(".").pop()?.toLowerCase() || "";
  const isSelected =
    selectedAttachment?.content.contentId === attachment.content.contentId &&
    !transitioning;
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(
    attachment.cloudFrontDownloadLink?.split(".").pop()?.toLowerCase() || ""
  );
  const isVideo = /^(mp4|avi|mkv|mov)$/i.test(
    attachment.cloudFrontDownloadLink?.split(".").pop()?.toLowerCase() || ""
  );
  const isImage = /^(jpg|jpeg|png|gif|heic|webp)$/i.test(
    attachment.cloudFrontDownloadLink?.split(".").pop()?.toLowerCase() || ""
  );

  // Helper function to render file icons based on extension
  const renderFileIcon = () => {
    switch (fileExtension) {
      case "zip":
      case "rar":
        return "📦";
      case "mp3":
      case "wav":
      case "ogg":
        return (
          <Image
            src={isSelected ? blueAudio : audioIcon}
            alt="audio icon"
            className="w-4 h-4"
          />
        );
      case "mp4":
      case "avi":
      case "mkv":
      case "mov":
        return (
          <video
            src={attachment.cloudFrontDownloadLink}
            className="w-4 h-4 rounded-sm object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
        );
      case "pdf":
      case "doc":
      case "docx":
        return "📄";
      case "xls":
      case "xlsx":
        return "📊";
      case "csv":
        return "📑";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "heic":
      case "webp":
        return (
          <img
            src={attachment.cloudFrontDownloadLink}
            alt="image icon"
            className="w-4 h-4 rounded-sm object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imageIcon.src;
            }}
          />
        );
      default:
        return "📄";
    }
  };

  if (attachment.type === "LINK") {
    return (
      <Image
        src={isSelected ? links : whitelinks}
        alt="link icon"
        className="w-6"
      />
    );
  }

  if (attachment.type === "TIMESTAMP" && attachment.cloudFrontDownloadLink) {
    return (
      <div className="flex items-center gap-1">
        <Image
          src={
            selectedAttachment?.content.id === attachment.content.id &&
            !transitioning
              ? bluestamp
              : whitestamp
          }
          alt="stamp icon"
          className="w-4 h-4"
        />
        <span>{formatTime(attachment.content.startTime || 0)}</span>
        {isAudio ? (
          <Image
            src={
              selectedAttachment?.content.id === attachment.content.id &&
              !transitioning
                ? blueAudio
                : audioIcon
            }
            alt="audio icon"
            className="w-4 h-4"
          />
        ) : (
          <Image
            src={
              selectedAttachment?.content.id === attachment.content.id &&
              !transitioning
                ? bluevideo
                : whitevideo
            }
            alt="video icon"
            className="w-4 h-4"
          />
        )}
      </div>
    );
  }

  if (
    attachment.type === "REFERENCE" &&
    (attachment.cloudFrontDownloadLink ||
      attachment.content.referencedAttachment?.url)
  ) {
    // Use cloudFrontDownloadLink if available; otherwise use the referencedAttachment URL
    const effectiveUrl =
      attachment.cloudFrontDownloadLink ||
      attachment.content.referencedAttachment?.url ||
      "";
    const fileExtension = effectiveUrl.split(".").pop()?.toLowerCase() || "";

    // Define a list of known file extensions for media
    const knownExtensions = [
      "zip",
      "rar",
      "mp3",
      "wav",
      "ogg",
      "mp4",
      "webm",
      "m4a",
      "avi",
      "mkv",
      "mov",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "heic",
      "webp",
      "json",
      "js",
      "txt",
      "md",
      "yaml",
      "yml",
      "toml",
      "css",
      "html",
      "xml",
      "jsonl",
      "jsonl.gz",
    ];

    // If the file extension isn't one of our known media types,
    // assume it's a link and render both the reference and link icons.
    if (!knownExtensions.includes(fileExtension)) {
      return (
        <div className="flex items-center gap-1">
          <Image
            src={isSelected ? bluereference : whitereference}
            alt="reference icon"
            className="w-4 h-4"
          />
          <Image
            src={isSelected ? links : whitelinks}
            alt="link icon"
            className="w-4 h-4"
          />
        </div>
      );
    }

    // Otherwise, render as a reference with additional info
    return (
      <div className="flex items-center gap-1">
        <Image
          src={
            selectedAttachment?.content.id === attachment.content.id &&
            !transitioning
              ? bluereference
              : whitereference
          }
          alt="reference icon"
          className="w-4 h-4"
        />
        <span>{formatTime(attachment.content.startTime || 0)}</span>
        {isAudio ? (
          <Image
            src={
              selectedAttachment?.content.id === attachment.content.id &&
              !transitioning
                ? blueAudio
                : audioIcon
            }
            alt="audio icon"
            className="w-4 h-4"
          />
        ) : isVideo ? (
          <Image
            src={
              selectedAttachment?.content.id === attachment.content.id &&
              !transitioning
                ? bluevideo
                : whitevideo
            }
            alt="video icon"
            className="w-4 h-4"
          />
        ) : isImage ? (
          <img
            src={attachment.cloudFrontDownloadLink}
            alt="image icon"
            className="w-4 h-4 rounded-sm object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = imageIcon.src;
            }}
          />
        ) : (
          renderFileIcon()
        )}
      </div>
    );
  }

  return renderFileIcon();
};
