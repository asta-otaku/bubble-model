// File type constants to ensure consistency across components
export const FILE_EXTENSIONS = {
  IMAGE: /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i,
  VIDEO: /^(mp4|webm|ogg|mov|avi|MOV)$/i,
  AUDIO: /^(mp3|wav|ogg|m4a)$/i,
  PDF: /^pdf$/i,
  ZIP: /^(zip|rar|7z)$/i,
  CSV: /^csv$/i,
  EXCEL: /^(xls|xlsx)$/i,
  JSON: /^json$/i,
  DOCUMENT: /^(pdf|doc|docx|txt|rtf|odt|pages)$/i,
  LINK: /^https?:\/\//,
} as const;

export type FileType = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'pdf' 
  | 'zip' 
  | 'csv' 
  | 'excel' 
  | 'json' 
  | 'document' 
  | 'link';

// Safe file extension extraction with null checks
export const getFileExtension = (filename: string | null | undefined): string => {
  if (!filename) return "";
  return filename.split(".").pop()?.toLowerCase() || "";
};

// Centralized file type detection
export const getFileType = (file: any): FileType => {
  const filename = file.content?.name || file.cloudFrontDownloadLink || "";
  const fileExtension = getFileExtension(filename);

  // Check if it's a link first
  const isLink = file.type === "LINK" && file.content?.url;
  if (isLink) return "link";

  // Check file extensions
  if (FILE_EXTENSIONS.IMAGE.test(fileExtension)) return "image";
  if (FILE_EXTENSIONS.VIDEO.test(fileExtension)) return "video";
  if (FILE_EXTENSIONS.AUDIO.test(fileExtension)) return "audio";
  if (FILE_EXTENSIONS.PDF.test(fileExtension)) return "pdf";
  if (FILE_EXTENSIONS.ZIP.test(fileExtension)) return "zip";
  if (FILE_EXTENSIONS.CSV.test(fileExtension)) return "csv";
  if (FILE_EXTENSIONS.EXCEL.test(fileExtension)) return "excel";
  if (FILE_EXTENSIONS.JSON.test(fileExtension)) return "json";
  if (FILE_EXTENSIONS.DOCUMENT.test(fileExtension)) return "document";

  return "document";
};

// Safe URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Extract hostname from URL safely
export const getDisplayUrl = (url: string): { hostname: string; origin: string } => {
  try {
    const parsed = new URL(url);
    return { hostname: parsed.hostname, origin: parsed.origin };
  } catch (error) {
    return { hostname: "", origin: "" };
  }
};

// File size formatting utility
export const formatFileSize = (bytes?: number): string => {
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

// Thumbnail URL extraction for images with proper fallbacks
export const getImageThumbnail = (file: any): string | null => {
  const fileType = getFileType(file);
  
  // Only process if it's actually an image
  if (fileType !== "image") return null;

  // Priority order for image thumbnails
  const thumbnailSources = [
    file.optimisedImageUrl,
    file.content?.optimisedImageUrl,
    file.content?.referencedAttachment?.optimisedImageUrl,
    file.content?.thumbnailImage,
    file.content?.referencedAttachment?.thumbnailImage,
  ];

  for (const source of thumbnailSources) {
    if (source) return source;
  }

  return null;
}; 