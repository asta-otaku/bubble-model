import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Message,
  NewCollectionResponse,
  AttachmentDto,
} from "@/utils/BubbleSpecialInterfaces";
import { convertUnixNanoToReadable } from "@/utils/getDateTime";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_COLLECTION_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

interface CollectionData {
  files: Message[];
  subCollections: any[];
  collectionTitle: string;
  collectionOwner: string;
  collectionDate: string;
  isLoading: boolean;
  isInitialized: boolean;
}

export const useCollectionData = (): CollectionData => {
  const { slug } = useParams();
  const [files, setFiles] = useState<Message[]>([]);
  const [subCollections, setSubCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionTitle, setCollectionTitle] = useState("Collection");
  const [collectionOwner, setCollectionOwner] = useState("Unknown");
  const [collectionDate, setCollectionDate] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to convert AttachmentDto to Message format
  const convertAttachmentToMessage = (attachment: AttachmentDto): Message => {
    const textAttachment = attachment.textAttachment;
    const attachedContent = textAttachment.attachedContent;

    // Determine if it's a link
    const isLink = textAttachment.type === 0;

    return {
      index: textAttachment.index,
      type: isLink ? "LINK" : "FILE",
      cloudFrontDownloadLink: textAttachment.cloudFrontDownloadLink,
      optimisedImageUrl: textAttachment.optimisedImageUrl,
      metaData: textAttachment.metaData,
      muxDetailsForWebclient:
        textAttachment.muxDetailsForWebclient || undefined,
      content: {
        contentId: attachedContent.id,
        startTime: 0,
        referencedAttachment: {
          thumbnailImage: attachedContent.thumbnailImage,
          name: attachedContent.name,
          size: attachedContent.size,
          width: attachedContent.width,
          height: attachedContent.height,
          muxPlaybackId: attachedContent.muxPlaybackId || "",
          muxDetailsForWebclient:
            textAttachment.muxDetailsForWebclient || undefined,
          id: attachedContent.id,
          url: isLink
            ? attachedContent.url
            : textAttachment.cloudFrontDownloadLink,
          optimisedImageUrl: textAttachment.optimisedImageUrl,
        },
        thumbnailImage: attachedContent.thumbnailImage,
        name: attachedContent.name,
        size: attachedContent.size,
        width: attachedContent.width,
        height: attachedContent.height,
        muxPlaybackId: attachedContent.muxPlaybackId || "",
        muxDetailsForWebclient:
          textAttachment.muxDetailsForWebclient || undefined,
        id: attachedContent.id,
        url: isLink
          ? attachedContent.url
          : textAttachment.cloudFrontDownloadLink,
        userId: "",
        optimisedImageUrl: textAttachment.optimisedImageUrl,
      },
    };
  };

  // Helper to extract only immediate subcollections (not nested ones)
  const extractImmediateSubCollections = (collectionDto: any): any[] => {
    return collectionDto.subCollections || [];
  };

  const fetchCollectionData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${SPECIAL_BUBBLE_BASE_URL}/api/newcollections/${slug}`,
        { publicId: slug },
        {
          headers: {
            "x-user-id": USER_ID,
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const collectionData: NewCollectionResponse = response.data;
      const rootAttachmentDtos =
        collectionData.webClientCollectionDto.attachmentDtos || [];

      rootAttachmentDtos.sort((a, b) => {
        const aTime = a.textAttachment.attachedContent.lastUpdatedTime || 0;
        const bTime = b.textAttachment.attachedContent.lastUpdatedTime || 0;
        return bTime - aTime;
      });

      const convertedFiles = rootAttachmentDtos.map(convertAttachmentToMessage);
      setFiles(convertedFiles);

      setCollectionTitle(
        collectionData.webClientCollectionDto.rootCollection.name ||
          "Collection"
      );
      setCollectionOwner(
        `${collectionData.sharer.firstName || ""} ${
          collectionData.sharer.lastName || ""
        }`.trim() || "Unknown"
      );
      setCollectionDate(
        convertUnixNanoToReadable(
          collectionData.webClientCollectionDto.rootCollection.createdAt
        )
      );

      let extractedSubs = extractImmediateSubCollections(
        collectionData.webClientCollectionDto
      );

      extractedSubs.sort((a: any, b: any) => {
        const aTime = a.rootCollection?.lastUpdatedTime || 0;
        const bTime = b.rootCollection?.lastUpdatedTime || 0;
        return bTime - aTime;
      });
      setSubCollections(extractedSubs);

      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error fetching collection data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCollectionData();
    }
  }, [slug]);

  return {
    files,
    subCollections,
    collectionTitle,
    collectionOwner,
    collectionDate,
    isLoading,
    isInitialized,
  };
}; 