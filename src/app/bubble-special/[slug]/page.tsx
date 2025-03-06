"use client";

import { useParams, useRouter } from "next/navigation";
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
  const { slug } = useParams();
  const router = useRouter();

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
          `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/details-with-image`,
          { messageId: slug, isDev: true },
          { headers: { "x-user-id": USER_ID, accept: "*/*" } }
        );

        const message = data.message;
        setOwner(data.ownerProfile.firstName || "");

        const processedAttachments =
          message.attachments.length === 1
            ? [...message.attachments, message.attachments[0]]
            : message.attachments;

        const processedMessage = {
          ...message,
          attachments: processedAttachments,
        };
        setBubbleData(processedMessage);

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

    // Sort attachments by index to ensure we process them in order
    const sortedAttachments = [...attachments]
      .filter((att) => typeof att.index === "number")
      .sort((a, b) => a.index - b.index);

    // Track dollar signs used for attachments (assuming indices are exact)
    const usedDollarPositions = new Set();

    // Mark dollar signs at exact attachment positions
    for (const attachment of sortedAttachments) {
      const index = attachment.index;
      if (content[index] === "$") {
        usedDollarPositions.add(index);
      }
    }

    // Render content with attachments at their exact indices
    const elements = [];
    let lastPos = 0;

    for (const attachment of sortedAttachments) {
      const index = attachment.index;

      // Add text before this attachment
      if (index > lastPos) {
        let textContent = "";
        for (let i = lastPos; i < index; i++) {
          // Skip dollar signs that are used for attachments
          if (!usedDollarPositions.has(i)) {
            textContent += content[i];
          }
        }

        if (textContent) {
          elements.push(
            <span
              key={`text-${lastPos}`}
              className="text-white inline"
              dangerouslySetInnerHTML={{ __html: textContent }}
            />
          );
        }
      }

      // Add the attachment
      const attachmentIndex = attachments.findIndex(
        (a) => a.content.id === attachment.content.id
      );
      elements.push(renderAttachmentButton(attachment, attachmentIndex));

      // Move past this position and the dollar sign if one exists
      if (content[index] === "$") {
        lastPos = index + 1; // Skip past the dollar sign
      } else {
        lastPos = index; // No dollar sign, just stay at the current position
      }
    }

    // Add any remaining text
    if (lastPos < content.length) {
      let textContent = "";
      for (let i = lastPos; i < content.length; i++) {
        // Skip dollar signs that are used for attachments
        if (!usedDollarPositions.has(i)) {
          textContent += content[i];
        }
      }

      if (textContent) {
        elements.push(
          <span
            key={`text-${lastPos}`}
            className="text-white inline"
            dangerouslySetInnerHTML={{ __html: textContent }}
          />
        );
      }
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
      // Try using cloudFrontDownloadLink, then content.url, then referencedAttachment.url as fallbacks
      let urlString =
        attachment.cloudFrontDownloadLink ||
        attachment.content.url ||
        attachment.content.referencedAttachment?.url ||
        "";
      if (urlString) {
        try {
          displayName = new URL(urlString).hostname.replace("www.", "");
        } catch (error) {
          console.error("Invalid URL", error);
        }
      }
    } else if (
      attachment.type === "TIMESTAMP" ||
      attachment.type === "REFERENCE"
    ) {
      displayName =
        attachment.content.referencedAttachment?.name ||
        attachment.metaData?.title ||
        // Fallback: try extracting hostname from content.url or referencedAttachment.url
        (attachment.content.url
          ? (() => {
              try {
                return new URL(attachment.content.url).hostname.replace(
                  "www.",
                  ""
                );
              } catch {
                return "";
              }
            })()
          : attachment.content.referencedAttachment?.url
          ? (() => {
              try {
                return new URL(
                  attachment.content.referencedAttachment.url
                ).hostname.replace("www.", "");
              } catch {
                return "";
              }
            })()
          : "");
    } else if (attachment.type === "USER") {
      displayName = attachment.content.name || "";
    } else {
      displayName = attachment.content.name || attachment.metaData?.title || "";
    }
    displayName = truncateFilename(displayName);

    return (
      <React.Fragment key={`attachment-${attachment.content.id}-${index}`}>
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
              {getFileIcon(
                attachment.cloudFrontDownloadLink || "",
                attachment,
                selectedAttachment,
                transitioning
              )}
            </span>
            <span className="text-inherit max-w-20 w-full truncate ml-1">
              {displayName}
            </span>
          </button>
        )}
      </React.Fragment>
    );
  };

  useEffect(() => {
    if (!isLoading && !bubbleData) {
      router.replace("/not-found");
    }
  }, [bubbleData, isLoading, router]);

  if (isLoading || !bubbleData) {
    return <div>Loading...</div>;
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
