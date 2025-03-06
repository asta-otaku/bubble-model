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
