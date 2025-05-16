export interface MetaDataContent {
  username: string;
  avatarUrl: string;
  mediaUrl: string;
  faviconUrl: string;
  dataText: string;
  title: string;
  fileType: number;
  size: number;
  streamAudioUrl: string;
}
export interface Message {
  index: number;
  type: "LINK" | "FILE" | "SYSTEM_MESSAGE" | "USER" | "TIMESTAMP" | "REFERENCE";
  cloudFrontDownloadLink: string;
  optimisedImageUrl?: string;
  metaData: null | MetaDataContent;
  content: {
    contentId: string;
    startTime: number;
    referencedAttachment: {
      thumbnailImage: string;
      name?: string;
      size: number;
      width: number;
      height: number;
      muxPlaybackId: string;
      id: string;
      url?: string;
      optimisedImageUrl?: string;
    };
    thumbnailImage: string;
    name: string;
    size: number;
    width: number;
    height: number;
    muxPlaybackId: string;
    id: string;
    url: string;
    userId: string;
    optimisedImageUrl?: string;
  };
}

export interface BubbleData {
  id: string;
  createdAt: string;
  ownerId: string;
  contentText: string;
  attachments: Message[];
  streamId: string;
  title: string;
  description: string;
  image: string;
}

export interface AttachedContent {
  thumbnailImage: string | null;
  name: string;
  size: number;
  width: number;
  height: number;
  muxPlaybackId: string | null;
  muxReadyForPlayback: boolean | null;
  folderId: string | null;
  lastUpdatedTime: number | null;
  id: string;
  url?: string;
}

export interface FileData {
  textAttachment: FileContent;
  ownerProfile: OwnerProfile;
  publicItemId: string;
  streamId: string;
  title: string;
  description: string;
  image: string;
}


// Updated interfaces to match the actual API response

export interface FileContent {
  index: number;
  type: string;
  attachedContent: AttachedContent;
  cloudFrontDownloadLink: string;
  optimisedImageUrl?: string;
  metaData: any;
}


export interface OwnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  lastUpdatedTime: number;
  isShadowProfile: boolean;
}

export interface BackendResponse {
  textAttachment: FileContent;
  ownerProfile: OwnerProfile;
  publicItemId: string;
  streamId: string;
  title: string;
  description: string;
  image: string;
}
