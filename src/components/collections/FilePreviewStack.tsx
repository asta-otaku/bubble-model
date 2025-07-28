import React from "react";
import { ThumbnailService } from "@/utils/thumbnailService";
import { truncateFilename } from "../TruncateText";
import useIsMobile from "@/utils";

interface FilePreviewStackProps {
  previewFiles?: any[];
  previewImages?: string[];
  subCollections?: any[];
  maxPreviews?: number;
  className?: string;
  showTitle?: boolean;
  title?: string;
  itemCount?: number;
  onClick?: () => void;
  variant?: "card" | "preview";
}

const FilePreviewStack: React.FC<FilePreviewStackProps> = ({
  previewFiles,
  previewImages,
  subCollections = [],
  maxPreviews = 3,
  className = "",
  showTitle = false,
  title,
  itemCount,
  onClick,
  variant = "preview",
}) => {
  // Process files using the centralized service
  const processedFiles = previewFiles
    ? ThumbnailService.processFiles(previewFiles, maxPreviews)
    : previewImages
    ? ThumbnailService.processImages(previewImages, maxPreviews)
    : [];

  // Combine files and subcollections
  const allPreviews = ThumbnailService.combinePreviews(
    processedFiles,
    subCollections,
    maxPreviews
  );
  const isMobile = useIsMobile();

  // Base container classes
  const baseClasses =
    "relative bg-[#F7F7F7] rounded-xl p-2 md:p-3 shadow-sm border border-[#E0E0E0] overflow-hidden";
  const sizeClasses =
    "w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px]";

  const containerClasses =
    variant === "card"
      ? `${baseClasses} ${sizeClasses} cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between`
      : `${baseClasses} ${sizeClasses} flex flex-col justify-center`;

  return (
    <div className={`${containerClasses} ${className}`} onClick={onClick}>
      {/* Stacked images container */}
      <div
        className={`relative ${
          variant === "card"
            ? "flex-1 flex items-center justify-center mt-2 mb-4"
            : "w-full h-full flex items-center justify-center"
        }`}
      >
        {allPreviews.map((item, idx) => (
          <div
            key={idx}
            className={`absolute rounded-lg shadow-md transition-transform duration-200
              ${
                allPreviews.length === 1
                  ? variant === "card"
                    ? "relative w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32"
                    : "relative w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32"
                  : idx === 0
                  ? variant === "card"
                    ? "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 z-10 left-2 top-2 md:left-3 md:top-3 lg:left-6 lg:top-6 rotate-[-8deg]"
                    : "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 -translate-x-3 -translate-y-3 md:-translate-x-4 md:-translate-y-4 lg:-translate-x-6 lg:-translate-y-6 rotate-[-8deg]"
                  : idx === 1
                  ? variant === "card"
                    ? "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 z-20 left-7 top-4 md:left-10 md:top-6 lg:left-16 lg:top-12 rotate-[6deg]"
                    : "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2 lg:translate-x-4 lg:translate-y-4 rotate-[6deg]"
                  : variant === "card"
                  ? "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 z-30 left-12 top-6 md:left-16 md:top-10 lg:left-26 lg:top-18 rotate-[-2deg]"
                  : "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 lg:translate-x-6 lg:translate-y-6 rotate-[-2deg]"
              }`}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            {item.isImage ? (
              <img
                src={item.thumbnail}
                alt="Preview"
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                <img
                  src={item.thumbnail}
                  alt="File type"
                  className="w-full h-full object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Title and item count for card variant */}
      {showTitle && variant === "card" && (
        <div className="flex flex-col gap-0.5">
          <span
            className="font-medium text-xs md:text-sm max-w-20 md:max-w-full w-full text-gray-900 truncate"
            title={title}
          >
            {truncateFilename(title || "", isMobile)}
          </span>
          {itemCount !== undefined && (
            <span className="text-[10px] md:text-xs text-gray-500">
              {itemCount} items
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilePreviewStack;
