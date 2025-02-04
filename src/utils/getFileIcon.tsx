import imageIcon from "../assets/imageIcon.svg";
import videoIcon from "../assets/videoIcon.svg";
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
import { Attachment } from "./BubbleSpecialInterfaces";
import Image from "next/image";
import { formatTime } from ".";

export const getFileIcon = (
  fileName: string,
  attachment: Attachment,
  selectedAttachment: Attachment | null,
  transitioning: boolean
) => {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(
    attachment.cloudFrontDownloadLink?.split(".").pop()?.toLowerCase() || ""
  );
  const isVideo = /^(mp4|avi|mkv)$/i.test(
    attachment.cloudFrontDownloadLink?.split(".").pop()?.toLowerCase() || ""
  );

  // If the content is a URL, we should handle it differently.
  if (attachment.type === "LINK" && attachment.content.url) {
    return (
      <Image
        src={
          selectedAttachment?.content.id === attachment.content.id &&
          !transitioning
            ? links
            : whitelinks
        }
        alt="link icon"
      />
    );
  }

  if (attachment.type === "TIMESTAMP" && attachment.cloudFrontDownloadLink) {
    return (
      <div className="flex items-center gap-1 mr-2">
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

  if (attachment.type === "REFERENCE" && attachment.cloudFrontDownloadLink) {
    return (
      <div className="flex items-center gap-1 mr-2">
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
        ) : null}
      </div>
    );
  }

  switch (fileExtension) {
    case "zip":
    case "rar":
      return "📦"; // Compressed files icon
    case "mp3":
    case "wav":
    case "ogg":
      return (
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
      ); // Audio file icon
    case "mp4":
    case "avi":
    case "mkv":
      return (
        <video
          src={attachment.cloudFrontDownloadLink}
          className="w-4 h-4 rounded-sm object-cover"
          muted
          loop
        />
      );
    case "pdf":
    case "doc":
    case "docx":
      return "📄"; // Document file icon
    case "xls":
    case "xlsx":
      return "📊"; // Spreadsheet file icon
    case "csv":
      return "📑"; // CSV file icon
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "heic":
      return <Image src={imageIcon} alt="image icon" className="w-4 h-4" />; // Image file icon
    default:
      return "📄"; // Default file icon for unsupported types
  }
};
