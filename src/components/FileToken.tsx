import React, { useState } from "react";
import "./FileToken.css";

interface FileTokenProps {
  fileName: string;
  onRemove: () => void; // Callback to remove the file token
}

const FileToken: React.FC<FileTokenProps> = ({ fileName }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleToggleSelect = () => {
    setIsSelected(!isSelected);
  };

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
        return "📊"; // Icon for excel files
      case "csv":
        return "📑"; // Icon for csv files
      default:
        return "📎"; // Default icon
    }
  };

  const fileExtension = getFileExtension(fileName);

  return (
    <div
      className={`file-token-button ${isSelected ? "selected" : ""}`}
      onClick={handleToggleSelect}
    >
      <span className="icon-container">{renderIcon(fileExtension)}</span>{" "}
      {/* Icon based on file type */}
      <span className={`file-name ${isSelected ? "selected" : ""}`}>
        {fileName}
      </span>
      {/* {isSelected && (
        <button className="remove-button" onClick={onRemove}>
          ❌
        </button>
      )} */}
    </div>
  );
};

export default FileToken;
