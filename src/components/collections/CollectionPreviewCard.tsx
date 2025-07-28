import React from "react";
import FilePreviewStack from "./FilePreviewStack";

interface CollectionPreviewCardProps {
  previewImages: string[];
  previewFiles?: any[];
  hasSubCollections?: boolean;
  subCollections?: any[];
}

const CollectionPreviewCard: React.FC<CollectionPreviewCardProps> = ({
  previewImages,
  previewFiles,
  hasSubCollections = false,
  subCollections = [],
}) => {
  return (
    <FilePreviewStack
      previewFiles={previewFiles}
      previewImages={previewImages}
      subCollections={hasSubCollections ? subCollections : []}
      maxPreviews={3}
      variant="preview"
    />
  );
};

export default CollectionPreviewCard;
