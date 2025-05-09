import imageIcon from "../assets/imageIcon.svg";
import audioIcon from "../assets/musicIcon.svg";
import videoIcon from "../assets/videoIcon.svg";
import docIcon from "../assets/doc.svg";
import { FileData, FileContent } from './BubbleSpecialInterfaces';

export const getFileTypeIcon = (fileData: FileData | null) => {
  if (!fileData) return null;
  
  // Get file URL from textAttachment
  const fileUrl = fileData.textAttachment?.cloudFrontDownloadLink || '';
  
  // Extract extension from URL or description
  const getExtensionFromUrl = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };
  
  const getExtensionFromDescription = (description: string) => {
    if (description.includes(':')) {
      const fileName = description.split(':')[1]?.trim() || '';
      return fileName.split('.').pop()?.toLowerCase() || '';
    }
    return '';
  };
  
  // Get extension from either URL or description
  const fileExtension = getExtensionFromUrl(fileUrl) || 
                        getExtensionFromDescription(fileData.description || '');
  
  // Check file types
  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic|tif)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isPDF = /^pdf$/i.test(fileExtension);
  const isDocument = /^(doc|docx|txt|rtf)$/i.test(fileExtension);
  const isSpreadsheet = /^(xls|xlsx|csv)$/i.test(fileExtension);
  const isCompressed = /^(zip|rar|7z)$/i.test(fileExtension);
  const isCode = /^(json|js|html|css|tsx|jsx|py|java|php)$/i.test(fileExtension);
  
  // For images and videos, use the actual file URL as the icon if available
  if (isImage && fileUrl) {
    return {
      iconType: 'url',
      iconUrl: fileUrl,
      icon: imageIcon, // Fallback
      label: "Image",
      extension: fileExtension
    };
  } else if (isVideo && fileUrl) {
    return {
      iconType: 'videoUrl',
      iconUrl: fileUrl,
      icon: videoIcon, // Fallback
      label: "Video",
      extension: fileExtension
    };
  } else if (isAudio) {
    return {
      icon: audioIcon,
      label: "Audio",
      extension: fileExtension
    };
  } else if (isPDF) {
    return {
      icon: docIcon,
      label: "PDF",
      extension: fileExtension
    };
  } else if (isDocument) {
    return {
      icon: docIcon,
      label: "Document",
      extension: fileExtension
    };
  } else if (isSpreadsheet) {
    return {
      icon: docIcon,
      label: "Spreadsheet",
      extension: fileExtension
    };
  } else if (isCompressed) {
    return {
      icon: docIcon,
      label: "Archive",
      extension: fileExtension
    };
  } else if (isCode) {
    return {
      icon: docIcon,
      label: "Code",
      extension: fileExtension
    };
  } else {
    // Default for unknown file types
    return {
      icon: docIcon,
      label: "File",
      extension: fileExtension
    };
  }
};

// Helper function to get a clean file name from description
export const getFileNameFromDescription = (description: string) => {
  if (!description) return '';
  
  // Check if it matches the pattern "File: something"
  const fileMatch = description.match(/^file:\s*(.*)/i);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1].trim();
  }
  
  return description;
};