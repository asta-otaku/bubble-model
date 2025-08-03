import { useMemo } from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { AttachmentDto } from "@/utils/BubbleSpecialInterfaces";
import { getDisplayUrl } from "@/utils/fileTypeUtils";
import { convertUnixNanoToReadable } from "@/utils/getDateTime";

interface DisplayData {
  displayFiles: Message[];
  displaySubCollections: any[];
  displayTitle: string;
  displayOwner: string;
  displayDate: string;
}

export const useDisplayData = (
  files: Message[],
  subCollections: any[],
  collectionTitle: string,
  collectionOwner: string,
  collectionDate: string,
  activeSubCollection: any | null,
  convertAttachmentToMessage: (attachment: AttachmentDto) => Message
): DisplayData => {
  return useMemo(() => {
    try {
      console.log("useDisplayData - activeSubCollection:", activeSubCollection?.rootCollection?.name);
      
      const displayFiles = activeSubCollection
        ? (activeSubCollection.attachmentDtos || []).map(convertAttachmentToMessage)
        : files;
      
      const displaySubCollections = activeSubCollection
        ? (activeSubCollection.subCollections || []).filter((sub: any) => sub && sub.rootCollection)
        : subCollections;
      
      const displayTitle = activeSubCollection
        ? activeSubCollection.rootCollection?.name ||
          getDisplayUrl(activeSubCollection.rootCollection?.url || "").hostname ||
          "Untitled"
        : collectionTitle;
      
      const displayOwner = activeSubCollection ? collectionOwner : collectionOwner;
      
      const displayDate = activeSubCollection
        ? convertUnixNanoToReadable(activeSubCollection.rootCollection?.createdAt || 0)
        : collectionDate;

      console.log("useDisplayData - result:", {
        displayFilesCount: displayFiles.length,
        displaySubCollectionsCount: displaySubCollections.length,
        displayTitle
      });

      return {
        displayFiles,
        displaySubCollections,
        displayTitle,
        displayOwner,
        displayDate,
      };
    } catch (error) {
      console.error("Error in useDisplayData:", error);
      // Return safe fallback values
      return {
        displayFiles: files,
        displaySubCollections: subCollections,
        displayTitle: collectionTitle,
        displayOwner: collectionOwner,
        displayDate: collectionDate,
      };
    }
  }, [
    files,
    subCollections,
    collectionTitle,
    collectionOwner,
    collectionDate,
    activeSubCollection?.rootCollection?.id, // Only depend on ID to prevent unnecessary recalculations
    convertAttachmentToMessage,
  ]);
}; 