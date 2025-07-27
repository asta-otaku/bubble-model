import audioThumbnail from "@/assets/audioThumbnail.svg";
import docThumbnail from "@/assets/docThumbnail.svg";
import linkThumbnail from "@/assets/linkThumbnail.svg";
import videoThumbnail from "@/assets/videoThumbnail.svg";

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

export function getThumbnailUrl(file: FileData | AttachmentDto): string {
  let filename = "";
  let muxPlaybackId = null;
  let muxReadyForPlayback = true; // Default to true
  let cloudFrontDownloadLink = "";
  let optimisedImageUrl = "";
  
  // Handle different data structures
  if ('textAttachment' in file) {
    // This is an AttachmentDto object (from subcollections)
    const attachment = file as AttachmentDto;
    filename = attachment.textAttachment.attachedContent.name;
    muxPlaybackId = attachment.textAttachment.attachedContent.muxPlaybackId;
    cloudFrontDownloadLink = attachment.textAttachment.cloudFrontDownloadLink;
    optimisedImageUrl = attachment.textAttachment.optimisedImageUrl;
    
    // Also check muxDetailsForWebclient
    if (attachment.textAttachment.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = attachment.textAttachment.muxDetailsForWebclient.muxPlaybackId;
      muxReadyForPlayback = attachment.textAttachment.muxDetailsForWebclient.muxReadyForPlayback ?? true;
    }
  } else {
    // This is a Message object (from main collection)
    const message = file as FileData;
    filename = message.content?.name || message.cloudFrontDownloadLink || "";
    cloudFrontDownloadLink = message.cloudFrontDownloadLink || "";
    optimisedImageUrl = message.optimisedImageUrl || "";
    
    // Check different possible locations for muxPlaybackId
    if (message.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = message.muxDetailsForWebclient.muxPlaybackId;
      muxReadyForPlayback = message.muxDetailsForWebclient.muxReadyForPlayback ?? true;
    } else if (message.content?.muxDetailsForWebclient?.muxPlaybackId) {
      muxPlaybackId = message.content.muxDetailsForWebclient.muxPlaybackId;
      muxReadyForPlayback = message.content.muxDetailsForWebclient.muxReadyForPlayback ?? true;
    } else if (message.content?.muxPlaybackId) {
      muxPlaybackId = message.content.muxPlaybackId;
    }
  }
  
  // Get file extension
  const fileExtension = filename.split(".").pop()?.toLowerCase() || "";
  
  // Check if it's a link (URL) - only check filename, not cloudFrontDownloadLink
  const isLink = /^https?:\/\//.test(filename);
  
  // Check file type
  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isDocument = /^(pdf|doc|docx|txt|rtf|odt|pages)$/i.test(fileExtension);
  
  // For links, use link thumbnail
  if (isLink) {
    return linkThumbnail;
  }
  
  // For images, use optimised image URL or fallback to cloudFrontDownloadLink
  if (isImage) {
    return optimisedImageUrl || cloudFrontDownloadLink || "";
  }
  
  // For videos, use Mux thumbnail if available and ready for playback
  if (isVideo) {
    if (muxPlaybackId && muxReadyForPlayback) {
      return `https://image.mux.com/${muxPlaybackId}/thumbnail.png`;
    }
    
    // Fallback to video thumbnail SVG if Mux is not available or not ready
    return videoThumbnail;
  }
  
  // For audio files, use the music icon
  if (isAudio) {
    return audioThumbnail;
  }
  
  // For documents, use document thumbnail
  if (isDocument) {
    return docThumbnail;
  }
  
  // For other file types, use document thumbnail as fallback
  return docThumbnail;
} 