export interface AttachmentContent {
  startTime?: number;
  contentId?: string;
  id: string;
  url?: string;
  thumbnailImage?: string | null;
  name?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
  fileName?: string;
}

export interface MetaDataContent {
  username?: string | null;
  avatarUrl?: string | null;
  mediaUrl?: string;
  faviconUrl?: string;
  dataText?: string;
  title?: string;
  fileType?: number;
  size?: number | null;
  streamAudioUrl?: string | null;
}

export interface Attachment {
  index: number;
  type: "LINK" | "FILE" | "SYSTEM_MESSAGE" | "USER" | "TIMESTAMP" | "REFERENCE";
  cloudFrontDownloadLink: string;
  metaData: null | MetaDataContent;
  content: AttachmentContent;
}

export interface BubbleData {
  _id: string;
  contentText: string;
  attachments: Attachment[];
  createdByPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  createdAt: number;
  ownerId: string;
  contentText: string;
  attachments: Attachment[];
  streamId: string;
  title: string;
  description: string;
  image: string;
}
export interface AttachmentContentPreview {
  url?: string;
  name?: string;
  type: string;
  id?: string;
  index: number;
  cloudFrontDownloadLink: null | string;
  metaData: null | MetaDataContent;
  content?: {
    name?: string;
    size?: number;
    height?: number | null;
    thumbnailImage?: string | null;
    url?: string;
    id?: string;
    startTime?: string; 
  };
}
