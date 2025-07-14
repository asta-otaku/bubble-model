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
  muxDetailsForWebclient?: MuxDetailsForWebclient;
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
      muxDetailsForWebclient?: MuxDetailsForWebclient;
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
    muxDetailsForWebclient?: MuxDetailsForWebclient;
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
  muxDetailsForWebclient?: MuxDetailsForWebclient;
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

export interface MuxDetailsForWebclient {
  muxPlaybackId: string;
  muxReadyForPlayback: boolean;
}

// New interfaces for the updated collection API
export interface Sharer {
  id: string;
  publicId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  lastUpdatedTime: number;
  deletedAt: number;
  isShadowProfile: boolean;
}

export interface RootCollection {
  id: string;
  name: string;
  streamId: string;
  parentFolderId: string | null;
  createdAt: number;
  deletedAt: number | null;
  lastUpdatedTime: number;
}

export interface AttachmentDto {
  textAttachment: {
    index: number;
    type: number;
    attachedContent: {
      thumbnailImage: string;
      name: string;
      size: number;
      width: number;
      height: number;
      muxPlaybackId: string | null;
      muxReadyForPlayback: boolean | null;
      folderId: string;
      storageId: string;
      lastUpdatedTime: number;
      deletedAt: number | null;
      id: string;
    };
    cloudFrontDownloadLink: string;
    optimisedImageUrl: string;
    metaData: any;
    muxDetailsForWebclient: MuxDetailsForWebclient | null;
  };
  ownerProfile: any | null;
  streamId: string | null;
  title: string;
  description: string;
  image: string | null;
  publicItemId: string | null;
}

export interface WebClientCollectionDto {
  rootCollection: RootCollection;
  attachmentDtos: AttachmentDto[];
  subCollections: WebClientCollectionDto[];
}

export interface NewCollectionResponse {
  sharer: Sharer;
  previewImageUrl: string;
  webClientCollectionDto: WebClientCollectionDto;
}
