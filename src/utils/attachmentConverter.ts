import { AttachmentDto, Message } from "@/utils/BubbleSpecialInterfaces";

/**
 * Converts AttachmentDto to Message format
 * This function is used across multiple components to ensure consistency
 */
export const convertAttachmentToMessage = (attachment: AttachmentDto): Message => {
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