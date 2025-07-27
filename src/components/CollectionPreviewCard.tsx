import React from "react";
import { getThumbnailUrl } from "@/utils/getThumbnailUrl";

interface CollectionPreviewCardProps {
  previewImages: string[]; // Array of image URLs
  previewFiles?: any[]; // Array of file objects for better thumbnail handling
}

const CollectionPreviewCard: React.FC<CollectionPreviewCardProps> = ({
  previewImages,
  previewFiles,
}) => {
  // If previewFiles is provided, use getThumbnailUrl for better file type handling
  const imagesToShow = previewFiles 
    ? previewFiles.slice(0, 3).map(file => getThumbnailUrl(file))
    : previewImages.slice(0, 3);

  return (
    <div className="relative bg-[#F7F7F7] rounded-xl p-3 shadow-sm w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px] flex flex-col justify-center border border-[#E0E0E0] overflow-hidden">
      {/* Stacked images container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {imagesToShow.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="Preview"
            className={`absolute rounded-lg object-cover shadow-md transition-transform duration-200
              ${
                imagesToShow.length === 1
                  ? "relative w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32" // Center single image
                  : idx === 0
                  ? "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 -translate-x-3 -translate-y-3 md:-translate-x-4 md:-translate-y-4 lg:-translate-x-6 lg:-translate-y-6 rotate-[-8deg]"
                  : idx === 1
                  ? "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2 lg:translate-x-4 lg:translate-y-4 rotate-[6deg]"
                  : "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 lg:translate-x-6 lg:translate-y-6 rotate-[-2deg]"
              }`}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CollectionPreviewCard; 