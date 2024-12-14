import imageIcon from "../assets/imageIcon.svg";
import videoIcon from "../assets/videoIcon.svg";
import audioIcon from "../assets/musicIcon.svg";
import blueAudio from "../assets/blueMusicIcon.svg";
import links from "../assets/chain.svg";
import whitelinks from "../assets/whitechain.svg";
import { Attachment } from "./BubbleSpecialInterfaces";
import Image from "next/image";

export const getFileIcon = (
  fileName: string,
  attachment: Attachment,
  selectedAttachment: Attachment | null,
  transitioning: boolean
) => {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

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
        className="w-4 h-4"
      />
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
      return <Image src={videoIcon} alt="video icon" className="w-4 h-4" />; // Video file icon
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
