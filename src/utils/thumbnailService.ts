import { getFileType, getImageThumbnail } from './fileTypeUtils';
import audioThumbnail from "@/assets/audioThumbnail.svg";
import docThumbnail from "@/assets/docThumbnail.svg";
import linkThumbnail from "@/assets/linkThumbnail.svg";
import subCollectionThumbnail from "@/assets/subCollectionThumbnail.svg";
import videoThumbnail from "@/assets/videoThumbnail.svg";

// Thumbnail asset mapping
export const THUMBNAIL_ASSETS = {
  audio: audioThumbnail.src,
  document: docThumbnail.src,
  link: linkThumbnail.src,
  subCollection: subCollectionThumbnail.src,
  video: videoThumbnail.src,
} as const;

interface FileData {
  content: {
    name: string;
    muxPlaybackId?: string;
    muxDetailsForWebclient?: {
      muxPlaybackId: string;
      muxReadyForPlayback?: boolean;
    };
  };
  muxDetailsForWebclient?: {
    muxPlaybackId: string;
    muxReadyForPlayback?: boolean;
  };
  cloudFrontDownloadLink?: string;
  optimisedImageUrl?: string;
}

interface AttachmentDto {
  textAttachment: {
    attachedContent: {
      name: string;
      muxPlaybackId: string | null;
    };
    cloudFrontDownloadLink: string;
    optimisedImageUrl: string;
    muxDetailsForWebclient: {
      muxPlaybackId: string;
      muxReadyForPlayback?: boolean;
    } | null;
  };
}

// Enhanced thumbnail service with proper null safety and video thumbnail logic
export class ThumbnailService {
  static getThumbnailUrl(file: FileData | AttachmentDto): string {
    let filename = "";
    let muxPlaybackId = null;
    let muxReadyForPlayback = false; // Default to false for safety
    let cloudFrontDownloadLink = "";
    let optimisedImageUrl = "";
    
    // Handle different data structures with null safety
    if ('textAttachment' in file) {
      // This is an AttachmentDto object (from subcollections)
      const attachment = file as AttachmentDto;
      filename = attachment.textAttachment.attachedContent.name || "";
      muxPlaybackId = attachment.textAttachment.attachedContent.muxPlaybackId;
      cloudFrontDownloadLink = attachment.textAttachment.cloudFrontDownloadLink || "";
      optimisedImageUrl = attachment.textAttachment.optimisedImageUrl || "";
      
      // Check muxDetailsForWebclient with proper null safety
      if (attachment.textAttachment.muxDetailsForWebclient?.muxPlaybackId) {
        muxPlaybackId = attachment.textAttachment.muxDetailsForWebclient.muxPlaybackId;
        muxReadyForPlayback = attachment.textAttachment.muxDetailsForWebclient.muxReadyForPlayback ?? false;
      }
    } else {
      // This is a Message object (from main collection)
      const message = file as FileData;
      filename = message.content?.name || message.cloudFrontDownloadLink || "";
      cloudFrontDownloadLink = message.cloudFrontDownloadLink || "";
      optimisedImageUrl = message.optimisedImageUrl || "";
      
      // Check different possible locations for muxPlaybackId with null safety
      if (message.muxDetailsForWebclient?.muxPlaybackId) {
        muxPlaybackId = message.muxDetailsForWebclient.muxPlaybackId;
        muxReadyForPlayback = message.muxDetailsForWebclient.muxReadyForPlayback ?? false;
      } else if (message.content?.muxDetailsForWebclient?.muxPlaybackId) {
        muxPlaybackId = message.content.muxDetailsForWebclient.muxPlaybackId;
        muxReadyForPlayback = message.content.muxDetailsForWebclient.muxReadyForPlayback ?? false;
      } else if (message.content?.muxPlaybackId) {
        muxPlaybackId = message.content.muxPlaybackId;
      }
    }
    
    // Get file type using centralized logic
    const fileType = getFileType({ content: { name: filename }, cloudFrontDownloadLink });
    
    // For links, use link thumbnail
    if (fileType === "link") {
      return THUMBNAIL_ASSETS.link;
    }
    
    // For images, use optimised image URL or fallback to cloudFrontDownloadLink
    if (fileType === "image") {
      return optimisedImageUrl || cloudFrontDownloadLink || "";
    }
    
    // For videos, use Mux thumbnail if available and ready for playback
    if (fileType === "video") {
      if (muxPlaybackId && muxReadyForPlayback) {
        return `https://image.mux.com/${muxPlaybackId}/thumbnail.png`;
      }
      
      // Fallback to video thumbnail SVG if Mux is not available or not ready
      return THUMBNAIL_ASSETS.video;
    }
    
    // For audio files, use the music icon
    if (fileType === "audio") {
      return THUMBNAIL_ASSETS.audio;
    }
    
    // For documents and other file types, use document thumbnail
    return THUMBNAIL_ASSETS.document;
  }

  // Get appropriate thumbnail for file type with fallbacks
  static getFileThumbnail(file: any): string {
    const fileType = getFileType(file);

    switch (fileType) {
      case "image":
        return getImageThumbnail(file) || this.getThumbnailUrl(file);
      case "video":
        return THUMBNAIL_ASSETS.video;
      case "audio":
        return THUMBNAIL_ASSETS.audio;
      case "link":
        return THUMBNAIL_ASSETS.link;
      case "pdf":
      case "document":
      case "zip":
      case "csv":
      case "excel":
      case "json":
      default:
        return THUMBNAIL_ASSETS.document;
    }
  }

  // Process files to get thumbnails with metadata
  static processFiles(files: any[], maxCount: number = 3) {
    return files.slice(0, maxCount).map((file) => {
      const fileType = getFileType(file);
      const thumbnail = this.getFileThumbnail(file);
      const isImage = fileType === "image";

      return {
        ...file,
        thumbnail,
        isImage,
        fileType,
      };
    });
  }

  // Process images array to thumbnail objects
  static processImages(images: string[], maxCount: number = 3) {
    return images.slice(0, maxCount).map((img) => ({ 
      thumbnail: img, 
      isImage: true,
      fileType: 'image' as const 
    }));
  }

  // Combine files and subcollections for preview
  static combinePreviews(
    processedFiles: any[], 
    subCollections: any[] = [], 
    maxTotal: number = 3
  ) {
    // Process subcollections first
    const subCollectionPreviews = subCollections
      .slice(0, maxTotal)
      .map((sub: any) => ({
        thumbnail: THUMBNAIL_ASSETS.subCollection,
        isImage: false,
        isSubCollection: true,
        fileType: 'subCollection' as const,
        title: sub.rootCollection?.name || "Untitled",
      }));

    // Add processed files after, up to remaining space
    const remainingSpace = maxTotal - subCollectionPreviews.length;
    const filePreviews = processedFiles.slice(0, remainingSpace);

    // Combine with subcollections first
    return [...subCollectionPreviews, ...filePreviews];
  }
} 