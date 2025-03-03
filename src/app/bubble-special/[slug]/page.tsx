"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TokenPreviewSpecial from "@/components/TokenPreviewSpecial";
import { truncateFilename } from "@/components/TruncateText";
import { getFileIcon } from "@/utils/getFileIcon";
import { BubbleData, Message } from "@/utils/BubbleSpecialInterfaces";
import { motion, useSpring, useMotionValue } from "framer-motion";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

function Page() {
  const router = useParams();
  const { slug } = router;

  const [bubbleData, setBubbleData] = useState<BubbleData | null>(null);
  const [owner, setOwner] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<Message | null>(
    null
  );
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

  const handleAttachmentSelect = (_: Message, targetIndex: number) => {
    if (!bubbleData || transitioning) return;

    setDirection(targetIndex > currentIndex ? 1 : -1);
    setTransitioning(true);
    setSelectedAttachment(bubbleData.attachments[targetIndex]);
    setCurrentIndex(targetIndex);

    setTimeout(() => setTransitioning(false), 200);
  };

  const renderContent = (content: string, attachments: Message[]) => {
    if (!content) return <p>No content available</p>;

    // Clone attachments to avoid modifying the original array
    const processedAttachments = [...attachments]
      .filter((att) => typeof att.index === "number")
      .sort((a, b) => a.index - b.index);

    // Find all dollar sign positions in the content string
    const dollarPositions: number[] = [];
    for (let i = 0; i < content.length; i++) {
      if (content[i] === "$") {
        dollarPositions.push(i);
      }
    }

    // Create a mapping between attachment indices and actual dollar sign positions
    // This handles cases where attachment.index doesn't exactly match a dollar sign position
    const indexMapping = new Map<number, number>();

    // Try to match each attachment to the closest dollar sign
    processedAttachments.forEach((attachment) => {
      // Find the closest dollar sign position to this attachment's index
      const closestDollarPos = dollarPositions.reduce((closest, current) => {
        return Math.abs(current - attachment.index) <
          Math.abs(closest - attachment.index)
          ? current
          : closest;
      }, Infinity);

      // Only map if we found a reasonably close dollar sign (within 3 characters)
      if (
        closestDollarPos !== Infinity &&
        Math.abs(closestDollarPos - attachment.index) <= 3
      ) {
        indexMapping.set(attachment.index, closestDollarPos);
      } else {
        // Keep the original index if no close dollar sign was found
        indexMapping.set(attachment.index, attachment.index);
      }
    });

    // Now render the content with our refined positions
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    processedAttachments.forEach((attachment) => {
      const mappedIndex =
        indexMapping.get(attachment.index) || attachment.index;

      // Add text before this token
      if (mappedIndex > lastIndex) {
        elements.push(
          <span
            key={`text-${lastIndex}`}
            className="text-white inline"
            dangerouslySetInnerHTML={{
              __html: content.substring(lastIndex, mappedIndex),
            }}
          />
        );
      }

      // Add the token button
      const attachmentIndex = attachments.findIndex(
        (a) => a.content.id === attachment.content.id
      );
      elements.push(renderAttachmentButton(attachment, attachmentIndex));

      // Move past the dollar sign if we're at one
      lastIndex = content[mappedIndex] === "$" ? mappedIndex + 1 : mappedIndex;
    });

    // Add any remaining text
    if (lastIndex < content.length) {
      elements.push(
        <span
          key={`text-${lastIndex}`}
          className="text-white inline"
          dangerouslySetInnerHTML={{ __html: content.substring(lastIndex) }}
        />
      );
    }

    return elements;
  };

  const renderAttachmentButton = (attachment: Message, index: number) => {
    const isSelected =
      selectedAttachment?.content.id === attachment.content.id &&
      !transitioning;
    const backgroundClass =
      isSelected && mounted
        ? "bg-white text-secondary"
        : "bg-[#FFFFFF33] text-white";
    let displayName = "";
    if (attachment.type === "LINK") {
      try {
        displayName = new URL(
          attachment.cloudFrontDownloadLink || attachment.content.url
        ).hostname.replace("www.", "");
      } catch (error) {
        console.error("Invalid URL", error);
      }
    } else if (
      attachment.type === "TIMESTAMP" ||
      attachment.type === "REFERENCE"
    ) {
      displayName =
        attachment.content.referencedAttachment?.name ||
        attachment.metaData?.title ||
        new URL(attachment.content.referencedAttachment.url).hostname.replace(
          "www.",
          ""
        ) ||
        "";
    } else if (attachment.type === "USER") {
      displayName = attachment.content.name || "";
    } else {
      displayName = attachment.content.name || attachment.metaData?.title || "";
    }
    displayName = truncateFilename(displayName);

    return (
      <>
        {attachment.type === "USER" ? (
          <span className="font-semibold">@{displayName}</span>
        ) : (
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
              {getFileIcon(attachment, selectedAttachment, transitioning)}
            </span>
            <span className="text-inherit max-w-20 w-full truncate ml-1">
              {displayName}
            </span>
          </button>
        )}
      </>
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
        className="w-[370px] mx-auto p-6"
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
