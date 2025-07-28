import React from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { truncateFilename } from "@/components/TruncateText";
import { getDisplayUrl } from "@/utils/fileTypeUtils";
import useIsMobile from "@/utils";
import SubCollectionCard from "./SubCollectionCard";
import CollectionFilePreview from "./CollectionFilePreview";
import { AttachmentDto } from "@/utils/BubbleSpecialInterfaces";

interface CollectionGridProps {
  displayFiles: Message[];
  displaySubCollections: any[];
  onSubCollectionClick: (sub: any) => void;
  onFileClick: (index: number) => void;
  convertAttachmentToMessage: (attachment: AttachmentDto) => Message;
}

const CollectionGrid: React.FC<CollectionGridProps> = ({
  displayFiles,
  displaySubCollections,
  onSubCollectionClick,
  onFileClick,
  convertAttachmentToMessage,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2 md:gap-x-2 justify-center">
      {/* Render subcollections first */}
      {displaySubCollections.map((sub: any, idx: number) => {
        const previewFiles = (sub.attachmentDtos || [])
          .slice(0, 3)
          .map(convertAttachmentToMessage);
        const previewImages = previewFiles.map(
          (file: any) =>
            file.content.optimisedImageUrl ||
            file.content.thumbnailImage ||
            file.cloudFrontDownloadLink
        );
        const fileCount = (sub.attachmentDtos || []).length;
        const subCollectionCount = (sub.subCollections || []).length;
        const itemCount = fileCount + subCollectionCount;
        const title =
          sub.rootCollection?.name ||
          getDisplayUrl(sub.rootCollection?.url).hostname ||
          "Untitled";
        return (
          <SubCollectionCard
            key={sub.rootCollection?.id || idx}
            title={title}
            itemCount={itemCount}
            previewFiles={previewFiles}
            previewImages={previewImages}
            subCollections={sub.subCollections || []}
            onClick={() => onSubCollectionClick(sub)}
          />
        );
      })}
      {/* Render files */}
      {displayFiles.map((file: any, idx: number) => (
        <div
          key={idx}
          onClick={() => onFileClick(idx)}
          className="rounded-2xl bg-white border border-[#1919191A] shadow flex flex-col items-center justify-center relative w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px] cursor-pointer overflow-hidden"
        >
          <CollectionFilePreview
            token={file}
            onFileClick={() => onFileClick(idx)}
          />
          <div className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap md:max-w-fit px-2 py-1 bg-[#EBEBEBBF] text-xs text-secondary rounded-full text-center border border-[#1919191A] absolute bottom-2 z-10">
            {truncateFilename(
              file.content.name ||
                file.cloudFrontDownloadLink ||
                getDisplayUrl(file.content.url).hostname ||
                "Unknown file",
              !isMobile
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid;
