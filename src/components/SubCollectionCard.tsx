import React from "react";
import { getThumbnailUrl } from "@/utils/getThumbnailUrl";
import audioThumbnail from "@/assets/audioThumbnail.svg";
import docThumbnail from "@/assets/docThumbnail.svg";
import linkThumbnail from "@/assets/linkThumbnail.svg";
import subCollectionThumbnail from "@/assets/subCollectionThumbnail.svg";
import videoThumbnail from "@/assets/videoThumbnail.svg";

interface SubCollectionCardProps {
  title: string;
  itemCount: number;
  previewImages: string[];
  previewFiles?: any[];
  subCollections?: any[];
  onClick?: () => void;
}

const SubCollectionCard: React.FC<SubCollectionCardProps> = ({
  title,
  itemCount,
  previewImages,
  previewFiles,
  subCollections = [],
  onClick,
}) => {
  // Helper function to get file extension
  const getFileExtension = (name: string) =>
    name.split(".").pop()?.toLowerCase() || "";

  // Helper function to determine file type
  const getFileType = (file: any) => {
    const filename = file.content?.name || file.cloudFrontDownloadLink || "";
    const fileExtension = getFileExtension(filename);

    const isLink = file.type === "LINK" && file.content?.url;
    const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(fileExtension);
    const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
    const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
    const isPDF = /^pdf$/i.test(fileExtension);
    const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
    const isCSV = /^csv$/i.test(fileExtension);
    const isExcel = /^(xls|xlsx)$/i.test(fileExtension);
    const isJSON = /^json$/i.test(fileExtension);

    if (isLink) return "link";
    if (isImage) return "image";
    if (isVideo) return "video";
    if (isAudio) return "audio";
    if (isPDF) return "pdf";
    if (isZip) return "zip";
    if (isCSV) return "csv";
    if (isExcel) return "excel";
    if (isJSON) return "json";
    return "document";
  };

  // Helper function to get image thumbnail only for actual images
  const getImageThumbnail = (file: any) => {
    // Only use optimized image URL if the file is actually an image
    if (file.optimisedImageUrl && getFileType(file) === "image") {
      return file.optimisedImageUrl;
    }
    if (file.content?.optimisedImageUrl && getFileType(file) === "image") {
      return file.content.optimisedImageUrl;
    }
    if (
      file.content?.referencedAttachment?.optimisedImageUrl &&
      getFileType(file) === "image"
    ) {
      return file.content.referencedAttachment.optimisedImageUrl;
    }
    // Fallback to other image sources for actual images
    if (file.content?.thumbnailImage && getFileType(file) === "image") {
      return file.content.thumbnailImage;
    }
    if (
      file.content?.referencedAttachment?.thumbnailImage &&
      getFileType(file) === "image"
    ) {
      return file.content.referencedAttachment.thumbnailImage;
    }
    return null;
  };

  // Helper function to get appropriate thumbnail for file type
  const getFileThumbnail = (file: any) => {
    const fileType = getFileType(file);

    let thumbnail;
    switch (fileType) {
      case "image":
        thumbnail = getImageThumbnail(file) || getThumbnailUrl(file);
        break;
      case "video":
        thumbnail = videoThumbnail.src;
        break;
      case "audio":
        thumbnail = audioThumbnail.src;
        break;
      case "pdf":
      case "document":
        thumbnail = docThumbnail.src;
        break;
      case "zip":
      case "csv":
      case "excel":
      case "json":
        thumbnail = docThumbnail.src;
        break;
      case "link":
        thumbnail = linkThumbnail.src;
        break;
      default:
        thumbnail = docThumbnail.src;
    }

    return thumbnail;
  };

  // Process files to get appropriate thumbnails
  const processedFiles = previewFiles
    ? previewFiles.slice(0, 3).map((file) => {
        const fileType = getFileType(file);
        const thumbnail = getFileThumbnail(file);
        const isImage = fileType === "image";

        return {
          ...file,
          thumbnail,
          isImage,
        };
      })
    : previewImages
        .slice(0, 3)
        .map((img) => ({ thumbnail: img, isImage: true }));

  // Combine files and subcollections for preview
  let allPreviews = [...processedFiles];

  // Add subcollection thumbnails if there are subcollections
  if (subCollections.length > 0) {
    const subCollectionPreviews = subCollections
      .slice(0, 3 - processedFiles.length)
      .map((sub: any) => ({
        thumbnail: subCollectionThumbnail.src,
        isImage: false,
        isSubCollection: true,
        title: sub.rootCollection?.name || "Untitled",
      }));
    allPreviews = [...allPreviews, ...subCollectionPreviews];
  }

  return (
    <div
      className="relative bg-[#F7F7F7] rounded-xl p-3 shadow-sm cursor-pointer w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px] flex flex-col justify-between border border-[#E0E0E0] hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Stacked images */}
      <div className="relative flex-1 flex items-center justify-center mt-2 mb-4">
        {allPreviews.map((item, idx) => (
          <div
            key={idx}
            className={`absolute rounded-lg shadow-md transition-transform duration-200
              w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32
              ${
                allPreviews.length === 1
                  ? "relative" // Center single image
                  : idx === 0
                  ? "z-10 left-2 top-2 md:left-3 md:top-3 lg:left-6 lg:top-6 rotate-[-8deg]"
                  : idx === 1
                  ? "z-20 left-7 top-4 md:left-10 md:top-6 lg:left-16 lg:top-12 rotate-[6deg]"
                  : "z-30 left-12 top-6 md:left-16 md:top-10 lg:left-26 lg:top-18 rotate-[-2deg]"
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
                  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 opacity-70"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Title and item count */}
      <div className="flex flex-col gap-0.5">
        <span
          className="font-medium text-sm text-gray-900 truncate"
          title={title}
        >
          {title}
        </span>
        <span className="text-xs text-gray-500">{itemCount} items</span>
      </div>
    </div>
  );
};

export default SubCollectionCard;
