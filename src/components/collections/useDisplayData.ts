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
    const displayFiles = activeSubCollection
      ? (activeSubCollection.attachmentDtos || []).map(convertAttachmentToMessage)
      : files;
    
    const displaySubCollections = activeSubCollection
      ? activeSubCollection.subCollections || []
      : subCollections;
    
    const displayTitle = activeSubCollection
      ? activeSubCollection.rootCollection?.name ||
        getDisplayUrl(activeSubCollection.rootCollection?.url).hostname ||
        "Untitled"
      : collectionTitle;
    
    const displayOwner = activeSubCollection ? collectionOwner : collectionOwner;
    
    const displayDate = activeSubCollection
      ? convertUnixNanoToReadable(activeSubCollection.rootCollection?.createdAt)
      : collectionDate;

    return {
      displayFiles,
      displaySubCollections,
      displayTitle,
      displayOwner,
      displayDate,
    };
  }, [
    files,
    subCollections,
    collectionTitle,
    collectionOwner,
    collectionDate,
    activeSubCollection,
    convertAttachmentToMessage,
  ]);
}; 