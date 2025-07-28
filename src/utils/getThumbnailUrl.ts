import { ThumbnailService } from "./thumbnailService";

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
  return ThumbnailService.getThumbnailUrl(file);
} 