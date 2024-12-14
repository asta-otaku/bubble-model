export interface AttachmentContent {
  url?: string;
  id?: string;
  name?: string;
  s3Url?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
  startTime?: number;
}

export interface MetaDataContent {
  username: null | string;
  avatarUrl: null | string;
  mediaUrl: string;
  faviconUrl: string;
  dataText: string;
  title: string;
  fileType: number;
  size: null | number;
  streamAudioUrl: string;
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
  };
}