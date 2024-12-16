"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import TokenPreviewSpecial from "@/components/TokenPreviewSpecial";
import { truncateFilename } from "@/components/TruncateText";
import { getFileIcon } from "@/utils/getFileIcon";
import { BubbleData, Attachment } from "@/utils/BubbleSpecialInterfaces";
import { motion, useSpring, useMotionValue } from "framer-motion";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

function Page() {
  const router = useParams();
  const { slug } = router;
  const [bubbleData, setBubbleData] = useState<BubbleData | null>(null);
  const [owner, setOwner] = useState<string>("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<Attachment | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [transitioning, setTransitioning] = useState<boolean>(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 50 });
  const springY = useSpring(y, { stiffness: 400, damping: 50 });
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);

  useEffect(() => {
    const fetchBubbleData = async () => {
      try {
        const response = await axios.post(
          `${SPECIAL_BUBBLE_BASE_URL}/api/artifacts/details`,
          { artifactId: slug, isDev: true },
          { headers: { "x-user-id": USER_ID, accept: "*/*" } }
        );
        const artifact = response.data.artifact;
        setOwner(response.data.ownerProfile.displayName);
        setBubbleData(artifact);
        setSelectedAttachment(artifact.attachments[0]);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error fetching bubble data", error);
      }
    };

    if (slug) {
      fetchBubbleData();
    }
  }, [slug]);

  const handleAttachmentSelect = (_: Attachment, targetIndex: number) => {
    if (!bubbleData || transitioning) return;

    setTransitioning(true);

    setSelectedAttachment(bubbleData.attachments[targetIndex]);
    setCurrentIndex(targetIndex);

    setTimeout(() => {
      setTransitioning(false);
    }, 200);
  };

  const renderContent = (content: string, attachments: Attachment[]) => {
    if (!content) return <p>No content available</p>;

    const contentParts = content.split("$");
    return contentParts.flatMap((part, index) => {
      const textElement = (
        <span
          key={`text-${index}`}
          className="text-white inline"
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
      const attachmentElement =
        index < contentParts.length - 1 && attachments[index]
          ? renderAttachmentButton(attachments[index], index)
          : null;
      return [textElement, attachmentElement];
    });
  };

  const renderAttachmentButton = (attachment: Attachment, index: number) => {
    const isSelected =
      selectedAttachment?.content.id === attachment.content.id &&
      !transitioning;
    const backgroundClass = isSelected
      ? "bg-white text-secondary"
      : "bg-[#FFFFFF33] text-white";
    const displayName = truncateFilename(
      attachment.type === "LINK"
        ? new URL(attachment.content.url || "").hostname.replace("www.", "")
        : attachment.content.name || ""
    );

    return (
      <button
        key={`attachment-${attachment.content.id}-${index}`}
        onClick={() => handleAttachmentSelect(attachment, index)}
        className={`inline-flex items-center gap-0.5 text-xs py-1 px-2 mx-0.5 rounded-3xl w-fit cursor-pointer ${backgroundClass}`}
      >
        <span>
          {getFileIcon(
            attachment.content.name || "",
            attachment,
            selectedAttachment,
            transitioning
          )}
        </span>
        <span className="text-inherit max-w-20 w-full truncate">
          {displayName}
        </span>
      </button>
    );
  };

  if (!bubbleData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center relative p-4">
      <motion.div
        className="w-[360px] mx-auto p-6"
        drag={!isDraggingDisabled}
        dragMomentum={false}
        style={{ x: springX, y: springY }}
        onDrag={(_, info) => {
          x.set(info.offset.x);
          y.set(info.offset.y);
        }}
        onDragEnd={() => {
          x.set(0);
          y.set(0);
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <article className="bg-gradient-to-b from-[#3076FF] to-[#1D49E5] w-full text-[17px] pt-3 rounded-2xl">
          <div className="px-3 font-light text-white whitespace-pre-wrap break-words">
            {renderContent(bubbleData.contentText, bubbleData.attachments)}
          </div>

          <div className="bubble-bottom mt-2 w-full">
            {selectedAttachment && (
              <TokenPreviewSpecial
                currentIndex={currentIndex}
                onTokenSwipe={(newIndex) =>
                  handleAttachmentSelect(
                    bubbleData.attachments[newIndex],
                    newIndex
                  )
                }
                allTokens={bubbleData.attachments}
                setIsDraggingDisabled={setIsDraggingDisabled}
              />
            )}
          </div>
        </article>
        <h2 className="text-[#7E7E7E] text-xs mt-1">{owner}</h2>
      </motion.div>
    </div>
  );
}

export default Page;
