import React, { useMemo } from "react";
import { AttachmentDto } from "@/utils/BubbleSpecialInterfaces";
import { getDisplayUrl } from "@/utils/fileTypeUtils";
import SubCollectionCard from "./SubCollectionCard";

interface SubCollectionGridItemProps {
  sub: any;
  index: number;
  convertAttachmentToMessage: (attachment: AttachmentDto) => any;
  onSubCollectionClick: (sub: any) => void;
}

const SubCollectionGridItem: React.FC<SubCollectionGridItemProps> = ({
  sub,
  index,
  convertAttachmentToMessage,
  onSubCollectionClick,
}) => {
  // Memoize preview files to prevent unnecessary re-processing
  const previewFiles = useMemo(() => {
    try {
      return (sub.attachmentDtos || [])
        .slice(0, 3)
        .map(convertAttachmentToMessage);
    } catch (error) {
      console.error("Error processing subcollection files:", error);
      return [];
    }
  }, [sub.attachmentDtos, convertAttachmentToMessage]);

  const previewImages = useMemo(() => {
    try {
      return previewFiles.map((file: any) => {
        // Safe nested object access with null checks
        return (
          file.content?.optimisedImageUrl ||
          file.content?.thumbnailImage ||
          file.cloudFrontDownloadLink ||
          ""
        );
      });
    } catch (error) {
      console.error("Error processing preview images:", error);
      return [];
    }
  }, [previewFiles]);

  const fileCount = (sub.attachmentDtos || []).length;
  const subCollectionCount = (sub.subCollections || []).length;
  const itemCount = fileCount + subCollectionCount;
  const title =
    sub.rootCollection?.name ||
    getDisplayUrl(sub.rootCollection?.url || "").hostname ||
    "Untitled";

  return (
    <SubCollectionCard
      key={sub.rootCollection?.id || index}
      title={title}
      itemCount={itemCount}
      previewFiles={previewFiles}
      previewImages={previewImages}
      subCollections={sub.subCollections || []}
      onClick={() => onSubCollectionClick(sub)}
    />
  );
};

export default SubCollectionGridItem;
