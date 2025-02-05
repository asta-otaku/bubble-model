"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import TokenPreviewSpecial from "@/components/TokenPreviewSpecial";
import { truncateFilename } from "@/components/TruncateText";
import { getFileIcon } from "@/utils/getFileIcon";
import { Attachment, Message } from "@/utils/BubbleSpecialInterfaces";
import { motion, useSpring, useMotionValue } from "framer-motion";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

function Page() {
  const router = useParams();
  const { slug } = router;

  const [bubbleData, setBubbleData] = useState<Message | null>(null);
  const [owner, setOwner] = useState("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<Attachment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);
  const firstTokenRef = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 50 });
  const springY = useSpring(y, { stiffness: 400, damping: 50 });
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBubbleData = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.post(
          `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/details`,
          { messageId: slug, isDev: true },
          { headers: { "x-user-id": USER_ID, accept: "*/*" } }
        );

        const artifact = data.message;
        setOwner(data.ownerProfile.firstName || "");

        const processedAttachments =
          artifact.attachments.length === 1
            ? [...artifact.attachments, artifact.attachments[0]]
            : artifact.attachments;

        const processedArtifact = {
          ...artifact,
          attachments: processedAttachments,
        };
        setBubbleData(processedArtifact);

        setSelectedAttachment(
          processedAttachments.length > 1 ? processedAttachments[1] : null
        );
        setCurrentIndex(processedAttachments.length > 1 ? 1 : 0);
        setDirection(processedAttachments.length > 1 ? -1 : 0);
      } catch (error) {
        console.error("Error fetching bubble data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchBubbleData();
  }, [slug]);

  useEffect(() => {
    if (!isLoading && bubbleData?.attachments?.length) {
      const timer = setTimeout(() => {
        firstTokenRef.current?.click();

        if (
          bubbleData.attachments.length > 1 &&
          bubbleData.attachments[0].content.id ===
            bubbleData.attachments[1].content.id
        ) {
          setBubbleData((prev) =>
            prev ? { ...prev, attachments: prev.attachments.slice(0, 1) } : null
          );
        }

        setMounted(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, bubbleData]);

  const handleAttachmentSelect = (_: Attachment, targetIndex: number) => {
    if (!bubbleData || transitioning) return;

    setDirection(targetIndex > currentIndex ? 1 : -1);
    setTransitioning(true);
    setSelectedAttachment(bubbleData.attachments[targetIndex]);
    setCurrentIndex(targetIndex);

    setTimeout(() => setTransitioning(false), 200);
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
    const backgroundClass =
      isSelected && mounted
        ? "bg-white text-secondary"
        : "bg-[#FFFFFF33] text-white";
    const displayName = truncateFilename(
      attachment.type === "LINK"
        ? new URL(attachment.content.url || "").hostname.replace("www.", "")
        : attachment.type === "TIMESTAMP" || attachment.type === "REFERENCE"
        ? attachment.content.parentAttachment?.fileName || ""
        : attachment.content.name || ""
    );

    return (
      <button
        ref={index === 0 ? firstTokenRef : null}
        key={`attachment-${attachment.content.id}-${index}`}
        onClick={() => handleAttachmentSelect(attachment, index)}
        className={`inline-flex items-center text-xs py-1 px-2 mx-0.5 rounded-3xl w-fit cursor-pointer ${backgroundClass} ${
          attachment.type === "REFERENCE" || attachment.type === "TIMESTAMP"
            ? "max-w-[172px] justify-between gap-1"
            : ""
        }`}
      >
        <span>
          {getFileIcon(
            attachment.content.name || "",
            attachment,
            selectedAttachment,
            transitioning
          )}
        </span>
        <span className="text-inherit max-w-20 w-full truncate ml-1">
          {displayName}
        </span>
      </button>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bubbleData) {
    if (typeof window !== "undefined") {
      window.location.href = "/not-found";
    }
    return null;
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center relative p-4">
      <motion.div
        className="w-[360px] mx-auto p-6"
        drag={!isDraggingDisabled && screenWidth > 768}
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
            <TokenPreviewSpecial
              currentIndex={currentIndex}
              direction={direction}
              onTokenSwipe={(newIndex) =>
                handleAttachmentSelect(
                  bubbleData.attachments[newIndex],
                  newIndex
                )
              }
              allTokens={bubbleData.attachments}
              setIsDraggingDisabled={setIsDraggingDisabled}
            />
          </div>
        </article>
        <h2 className="text-[#7E7E7E] text-xs mt-1 capitalize">{owner}</h2>
      </motion.div>
    </div>
  );
}

export default Page;
