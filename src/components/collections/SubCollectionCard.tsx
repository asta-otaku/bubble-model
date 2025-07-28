import React from "react";
import FilePreviewStack from "./FilePreviewStack";

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
  return (
    <FilePreviewStack
      previewFiles={previewFiles}
      previewImages={previewImages}
      subCollections={subCollections}
      maxPreviews={3}
      showTitle={true}
      title={title}
      itemCount={itemCount}
      onClick={onClick}
      variant="card"
    />
  );
};

export default SubCollectionCard;
