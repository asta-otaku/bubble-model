import React from "react";
import CollectionPreviewCard from "./CollectionPreviewCard";
import DownloadAllCollectionsButton from "../DownloadAllCollectionsButton";
import { Message } from "@/utils/BubbleSpecialInterfaces";

interface CollectionHeaderProps {
  displayFiles: Message[];
  displaySubCollections: any[];
  displayTitle: string;
  displayOwner: string;
  displayDate: string;
  activeSubCollection: any | null;
}

const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  displayFiles,
  displaySubCollections,
  displayTitle,
  displayOwner,
  displayDate,
  activeSubCollection,
}) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <CollectionPreviewCard
        previewFiles={displayFiles.slice(0, 3)}
        previewImages={displayFiles
          .slice(0, 3)
          .map(
            (file: any) =>
              file.content.optimisedImageUrl ||
              file.content.thumbnailImage ||
              file.cloudFrontDownloadLink
          )}
        hasSubCollections={displaySubCollections.length > 0}
        subCollections={displaySubCollections}
      />
      <h2 className="font-semibold text-lg md:text-xl text-gray-900 mt-4 text-center">
        {displayTitle}
      </h2>
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
        <span>{displayFiles.length + displaySubCollections.length} items</span>
        <span>•</span>
        <span>{displayDate}</span>
        <span>•</span>
        <span>{displayOwner}</span>
      </div>
      <div className="mt-4">
        <DownloadAllCollectionsButton
          collectionTitle={displayTitle}
          disabled={displayFiles.length === 0}
          isSubCollection={!!activeSubCollection}
          subCollectionId={activeSubCollection?.rootCollection?.id}
          files={displayFiles}
        />
      </div>
    </div>
  );
};

export default CollectionHeader;
