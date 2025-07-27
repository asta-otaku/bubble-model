import React from "react";
import { getThumbnailUrl } from "@/utils/getThumbnailUrl";

interface SubCollectionCardProps {
  title: string;
  itemCount: number;
  previewImages: string[]; // Array of image URLs
  previewFiles?: any[]; // Array of file objects for better thumbnail handling
  onClick?: () => void;
}

const SubCollectionCard: React.FC<SubCollectionCardProps> = ({
  title,
  itemCount,
  previewImages,
  previewFiles,
  onClick,
}) => {
  // If previewFiles is provided, use getThumbnailUrl for better file type handling
  const imagesToShow = previewFiles 
    ? previewFiles.slice(0, 3).map(file => getThumbnailUrl(file))
    : previewImages.slice(0, 3);

  return (
    <div
      className="relative bg-[#F7F7F7] rounded-xl p-3 shadow-sm cursor-pointer w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px] flex flex-col justify-between border border-[#E0E0E0] hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Dots menu (top right) */}
      {/* <div className="absolute top-3 right-3 flex gap-0.5">
        <span className="w-1 h-1 bg-gray-400 rounded-full inline-block" />
        <span className="w-1 h-1 bg-gray-400 rounded-full inline-block" />
        <span className="w-1 h-1 bg-gray-400 rounded-full inline-block" />
      </div> */}
      {/* Stacked images */}
      <div className="relative flex-1 flex items-center justify-center mt-2 mb-4">
        {imagesToShow.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="Preview"
            className={`absolute rounded-lg object-cover 
              w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 shadow-md transition-transform duration-200
              ${
                imagesToShow.length === 1
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
          />
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