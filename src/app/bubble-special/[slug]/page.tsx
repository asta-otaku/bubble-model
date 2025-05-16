"use client";

import { useParams, useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import TokenPreviewSpecial from "@/components/TokenPreviewSpecial";
import { truncateFilename } from "@/components/TruncateText";
import { getFileIcon } from "@/utils/getFileIcon";
import { BubbleData, Message } from "@/utils/BubbleSpecialInterfaces";
import { motion, useSpring, useMotionValue } from "framer-motion";
import BubbleDownloadAllButton from "@/components/BubbleDownloadAllButton";
import { convertUnixNanoToReadable } from "@/utils/getDateTime";
import FloatingNav from "@/components/FloatingNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

const throttle = (fn: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};

function Page() {
  const { slug } = useParams();
  const router = useRouter();
  const [state, setState] = useState<{
    bubbleData: BubbleData | null;
    owner: string;
    lastUpdated: string;
    isLoading: boolean;
  }>({
    bubbleData: null,
    owner: "",
    lastUpdated: "",
    isLoading: true,
  });

  const [selectedAttachment, setSelectedAttachment] = useState<Message | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);
  const firstTokenRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<AbortController>();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 50 });
  const springY = useSpring(y, { stiffness: 400, damping: 50 });
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  const fetchBubbleData = useCallback(async () => {
    if (!slug) return;

    controllerRef.current = new AbortController();
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data } = await axios.post(
        `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/message/${slug}`,
        {
          headers: { "x-user-id": USER_ID, accept: "*/*" },
          signal: controllerRef.current.signal,
        }
      );

      const message = data.message;
      const processedAttachments = processAttachments(message.attachments);

      setState({
        bubbleData: { ...message, attachments: processedAttachments },
        owner: data.ownerProfile.firstName || "",
        lastUpdated: convertUnixNanoToReadable(
          data.ownerProfile.lastUpdatedTime
        ),
        isLoading: false,
      });

      setSelectedAttachment(processedAttachments[0]);
      setMounted(true);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error fetching bubble data", error);
        router.replace("/not-found");
      }
    }
  }, [slug, router]);

  const processAttachments = useCallback((attachments: Message[]) => {
    const sorted = [...attachments].sort((a, b) => a.index - b.index);
    return sorted.length === 1 ? [...sorted, sorted[0]] : sorted;
  }, []);

  useEffect(() => {
    fetchBubbleData();
    return () => controllerRef.current?.abort();
  }, [fetchBubbleData]);

  const getDisplayName = useCallback((attachment: Message) => {
    if (attachment.type === "LINK") {
      const urlString =
        attachment.optimisedImageUrl ||
        attachment.content.url ||
        attachment.content.referencedAttachment?.url ||
        "";
      try {
        return new URL(urlString).hostname.replace("www.", "");
      } catch {
        return truncateFilename(urlString);
      }
    }

    if (attachment.type === "TIMESTAMP" || attachment.type === "REFERENCE") {
      return (
        attachment.content.referencedAttachment?.name ||
        attachment.metaData?.title ||
        getHostnameFromUrl(
          attachment.content.url || attachment.content.referencedAttachment?.url
        )
      );
    }

    if (attachment.type === "USER") {
      return `@${attachment.content.name}`;
    }

    return truncateFilename(
      attachment.content.name || attachment.metaData?.title || ""
    );
  }, []);

  const getHostnameFromUrl = useCallback((url?: string) => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return truncateFilename(url);
    }
  }, []);

  const handleAttachmentSelect = useCallback(
    (_: Message, targetIndex: number) => {
      if (!state.bubbleData || transitioning) return;

      setDirection(targetIndex > currentIndex ? 1 : -1);
      setTransitioning(true);
      setSelectedAttachment(state.bubbleData.attachments[targetIndex]);
      setCurrentIndex(targetIndex);

      setTimeout(() => setTransitioning(false), 200);
    },
    [state.bubbleData, currentIndex, transitioning]
  );

  const renderAttachmentButton = useCallback(
    (attachment: Message, index: number) => {
      const isSelected =
        selectedAttachment?.content.id === attachment.content.id &&
        !transitioning;
      const backgroundClass =
        isSelected && mounted
          ? "bg-white text-secondary"
          : "bg-[#FFFFFF33] text-white";
      const displayName = getDisplayName(attachment);

      return (
        <button
          ref={index === 0 ? firstTokenRef : null}
          key={`${attachment.content.id}-${index}`}
          onClick={() => handleAttachmentSelect(attachment, index)}
          className={`inline-flex items-center text-xs py-1 px-2 mx-0.5 rounded-3xl w-fit cursor-pointer ${backgroundClass} ${
            attachment.type === "REFERENCE" || attachment.type === "TIMESTAMP"
              ? "max-w-[160px] justify-between gap-1"
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
      );
    },
    [
      selectedAttachment,
      transitioning,
      mounted,
      getDisplayName,
      handleAttachmentSelect,
    ]
  );

  const contentElements = useMemo(() => {
    if (!state.bubbleData) return [];

    const { contentText, attachments } = state.bubbleData;
    const elements = [];
    let lastPos = 0;
    const usedDollarPositions = new Set<number>();

    attachments.forEach((attachment) => {
      const index = attachment.index;
      if (contentText[index] === "$") usedDollarPositions.add(index);
    });

    attachments.forEach((attachment, idx) => {
      const index = attachment.index;

      if (index > lastPos) {
        const textContent = contentText
          .slice(lastPos, index)
          .replace(/\$/g, (_, i) =>
            usedDollarPositions.has(lastPos + i) ? "" : "$"
          );
        if (textContent) {
          elements.push(
            <span key={`text-${lastPos}`} className="text-white inline">
              {textContent}
            </span>
          );
        }
      }

      elements.push(renderAttachmentButton(attachment, idx));
      lastPos = contentText[index] === "$" ? index + 1 : index;
    });

    if (lastPos < contentText.length) {
      const textContent = contentText
        .slice(lastPos)
        .replace(/\$/g, (_, i) =>
          usedDollarPositions.has(lastPos + i) ? "" : "$"
        );
      if (textContent) {
        elements.push(
          <span key={`text-${lastPos}`} className="text-white inline">
            {textContent}
          </span>
        );
      }
    }

    return elements;
  }, [state.bubbleData, renderAttachmentButton]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    const throttledResize = throttle(handleResize, 200);
    window.addEventListener("resize", throttledResize);
    return () => window.removeEventListener("resize", throttledResize);
  }, []);

  if (state.isLoading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center p-4">
        <div className="w-[360px] mx-auto p-6">
          <Skeleton height={20} width={200} className="mb-4" />
          <Skeleton height={300} className="rounded-2xl" />
          <div className="mt-4 flex gap-2">
            <Skeleton circle height={40} width={40} />
            <Skeleton circle height={40} width={40} />
            <Skeleton circle height={40} width={40} />
          </div>
        </div>
      </div>
    );
  }

  if (!state.bubbleData) {
    return null;
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center relative p-4">
      <FloatingNav />
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
        <div className="text-[#7E7E7E] text-xs mt-1 capitalize flex justify-center items-center gap-2 py-1">
          <span className="font-bold">{state.owner}</span>
          <span>•</span>
          <span className="font-normal">{state.lastUpdated}</span>
        </div>
        <article className="bg-gradient-to-b from-[#3076FF] to-[#1D49E5] w-full text-[17px] pt-3 rounded-2xl">
          <div className="px-3 font-light text-white whitespace-pre-wrap break-words">
            {contentElements}
          </div>

          <div className="bubble-bottom mt-2 w-full">
            <TokenPreviewSpecial
              currentIndex={currentIndex}
              direction={direction}
              onTokenSwipe={(newIndex) =>
                handleAttachmentSelect(
                  state.bubbleData!.attachments[newIndex],
                  newIndex
                )
              }
              allTokens={state.bubbleData.attachments}
              setIsDraggingDisabled={setIsDraggingDisabled}
            />
          </div>
        </article>
        <div className="fixed bottom-[10px] md:bottom-[25.5px] left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
          <BubbleDownloadAllButton attachments={state.bubbleData.attachments} />
        </div>
      </motion.div>
    </div>
  );
}

export default Page;
