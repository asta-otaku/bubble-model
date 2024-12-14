import React from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { truncateFilename } from "../TruncateText";

interface FileTokenProps {
  node: any;
  selected: boolean; // This comes from TipTap's NodeViewProps
}

const FileTokenComponent: React.FC<FileTokenProps> = ({ node, selected }) => {
  const { fileName } = node.attrs;

  // Function to get the file extension
  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toLowerCase();
  };

  // Function to render the appropriate icon based on the file extension
  const renderIcon = (fileExtension: string | undefined) => {
    switch (fileExtension) {
      case "zip":
      case "rar":
        return "📦"; // Icon for zip files
      case "mp3":
      case "wav":
      case "ogg":
        return "🎵"; // Icon for audio files
      case "mp4":
      case "avi":
      case "mkv":
        return "🎥"; // Icon for video files
      case "pdf":
      case "doc":
      case "docx":
        return "📄"; // Icon for document files
      case "xls":
      case "xlsx":
        return "📊"; // Icon for Excel files
      case "csv":
        return "📑"; // Icon for CSV files
      default:
        return "📄"; // Default icon for unknown file types
    }
  };

  const fileExtension = getFileExtension(fileName);

  return (
    <NodeViewWrapper
      className={`inline-flex items-center rounded-xl py-1 px-2 mx-[5px] text-sm cursor-pointer border border-transparent ${
        selected ? "bg-white text-secondary" : "bg-[#FFFFFF33] text-white"
      }`}
    >
      <span className="flex gap-1 items-center">
        {/* Render appropriate icon based on file type */}
        <span>{renderIcon(fileExtension)}</span>
        <span className="text-inherit max-w-20 w-full truncate">
          {truncateFilename(fileName)}
        </span>
      </span>
    </NodeViewWrapper>
  );
};

export default FileTokenComponent;
