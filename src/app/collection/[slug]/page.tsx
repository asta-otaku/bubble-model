"use client";

import React, { useEffect, useState } from "react";
import blackTypo from "@/assets/blackTypo.svg";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { truncateFilename } from "@/components/TruncateText";
import useIsMobile from "@/utils";
import axios from "axios";
import { useParams, useRouter, usePathname } from "next/navigation";
import {
  Message,
  NewCollectionResponse,
  AttachmentDto,
} from "@/utils/BubbleSpecialInterfaces";
import CollectionFilePreview from "@/components/CollectionFilePreview";
import CollectionFileModal from "@/components/CollectionFileModal";
import SubCollectionCard from "@/components/SubCollectionCard";
import CollectionPreviewCard from "@/components/CollectionPreviewCard";
import DownloadAllCollectionsButton from "@/components/DownloadAllCollectionsButton";
import { convertUnixNanoToReadable } from "@/utils/getDateTime";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_COLLECTION_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

// Navigation state interface
interface NavigationState {
  activeSubCollectionId: string | null;
  activeSubCollection: any | null;
  parentLevel: { id: string; name: string; type: string } | null;
}

const page = () => {
  const { slug } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [files, setFiles] = useState<Message[]>([]);
  const [subCollections, setSubCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionTitle, setCollectionTitle] = useState("Collection");
  const [collectionOwner, setCollectionOwner] = useState("Unknown");
  const [collectionDate, setCollectionDate] = useState("");
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [modalFiles, setModalFiles] = useState<Message[]>([]);
  const [activeSubCollection, setActiveSubCollection] = useState<any | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  // Simplified parent tracking - only store immediate parent
  const [parentLevel, setParentLevel] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);

  // Helper function to convert AttachmentDto to Message format
  const convertAttachmentToMessage = (attachment: AttachmentDto): Message => {
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

  // Helper function to recursively extract all attachments from collections and subcollections
  const extractAllAttachments = (collectionDto: any): AttachmentDto[] => {
    let allAttachments: AttachmentDto[] = [];

    // Add attachments from current collection
    if (collectionDto.attachmentDtos) {
      allAttachments = [...allAttachments, ...collectionDto.attachmentDtos];
    }

    // Recursively add attachments from subcollections
    if (collectionDto.subCollections) {
      collectionDto.subCollections.forEach((subCollection: any) => {
        allAttachments = [
          ...allAttachments,
          ...extractAllAttachments(subCollection),
        ];
      });
    }

    return allAttachments;
  };

  // Helper to extract only immediate subcollections (not nested ones)
  const extractImmediateSubCollections = (collectionDto: any): any[] => {
    return collectionDto.subCollections || [];
  };

  // Helper to find subcollection by ID recursively
  const findSubCollectionById = (id: string): any | null => {
    if (!subCollections || subCollections.length === 0) {
      return null;
    }

    const findInSubs = (subs: any[]): any | null => {
      for (const sub of subs) {
        if (sub.rootCollection?.id === id) {
          return sub;
        }
        if (sub.subCollections) {
          const found = findInSubs(sub.subCollections);
          if (found) return found;
        }
      }
      return null;
    };
    return findInSubs(subCollections);
  };

  // Helper to find parent of a subcollection
  const findParentOfSubCollection = (
    targetId: string
  ): { id: string; name: string; type: string } | null => {
    const findParentInSubs = (
      subs: any[],
      parentInfo: { id: string; name: string; type: string }
    ): { id: string; name: string; type: string } | null => {
      for (const sub of subs) {
        if (sub.rootCollection?.id === targetId) {
          return parentInfo;
        }
        if (sub.subCollections) {
          const found = findParentInSubs(sub.subCollections, {
            id: sub.rootCollection?.id,
            name: sub.rootCollection?.name || "Untitled",
            type: "subcollection",
          });
          if (found) return found;
        }
      }
      return null;
    };

    // Check if target is a direct child of main collection
    for (const sub of subCollections) {
      if (sub.rootCollection?.id === targetId) {
        return {
          id: "root",
          name: collectionTitle,
          type: "collection",
        };
      }
    }

    // Check nested subcollections
    return findParentInSubs(subCollections, {
      id: "root",
      name: collectionTitle,
      type: "collection",
    });
  };

  // Update browser history without changing URL
  const updateHistoryState = (
    subCollection: any | null,
    parent: { id: string; name: string; type: string } | null
  ) => {
    const state: NavigationState = {
      activeSubCollectionId: subCollection?.rootCollection?.id || null,
      activeSubCollection: subCollection,
      parentLevel: parent,
    };

    // Push new history entry to enable back/forward navigation
    window.history.pushState(state, "", pathname);
    console.log("History state updated:", state);
  };

  // Handle browser back/forward navigation
  const handlePopState = (event: PopStateEvent) => {
    console.log("PopState event triggered:", event.state);
    const state = event.state as NavigationState | null;

    if (state?.activeSubCollectionId) {
      const subCollection = findSubCollectionById(state.activeSubCollectionId);
      if (subCollection) {
        setActiveSubCollection(subCollection);
        setParentLevel(state.parentLevel);
        console.log(
          "Restored subcollection:",
          subCollection.rootCollection?.name
        );
      } else {
        // If subcollection not found, fall back to main collection
        setActiveSubCollection(null);
        setParentLevel(null);
        updateHistoryState(null, null);
        console.log("Subcollection not found, falling back to main collection");
      }
    } else {
      setActiveSubCollection(null);
      setParentLevel(null);
      console.log("No active subcollection, showing main collection");
    }
  };

  const fetchCollectionData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${SPECIAL_BUBBLE_BASE_URL}/api/newcollections/${slug}`,
        { publicId: slug },
        {
          headers: {
            "x-user-id": USER_ID,
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      const collectionData: NewCollectionResponse = response.data;
      const rootAttachmentDtos =
        collectionData.webClientCollectionDto.attachmentDtos || [];

      rootAttachmentDtos.sort((a, b) => {
        const aTime = a.textAttachment.attachedContent.lastUpdatedTime || 0;
        const bTime = b.textAttachment.attachedContent.lastUpdatedTime || 0;
        return bTime - aTime;
      });

      const convertedFiles = rootAttachmentDtos.map(convertAttachmentToMessage);
      setFiles(convertedFiles);

      setCollectionTitle(
        collectionData.webClientCollectionDto.rootCollection.name ||
          "Collection"
      );
      setCollectionOwner(
        `${collectionData.sharer.firstName || ""} ${
          collectionData.sharer.lastName || ""
        }`.trim() || "Unknown"
      );
      setCollectionDate(
        convertUnixNanoToReadable(
          collectionData.webClientCollectionDto.rootCollection.createdAt
        )
      );

      let extractedSubs = extractImmediateSubCollections(
        collectionData.webClientCollectionDto
      );

      extractedSubs.sort((a: any, b: any) => {
        const aTime = a.rootCollection?.lastUpdatedTime || 0;
        const bTime = b.rootCollection?.lastUpdatedTime || 0;
        return bTime - aTime;
      });
      setSubCollections(extractedSubs);

      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error fetching collection data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // When a subcollection card is clicked, show its contents and update history
  const handleSubCollectionClick = (sub: any) => {
    // Set the current level as parent for the new subcollection
    const newParent = {
      id: activeSubCollection?.rootCollection?.id || "root",
      name: activeSubCollection?.rootCollection?.name || collectionTitle,
      type: activeSubCollection ? "subcollection" : "collection",
    };

    setParentLevel(newParent);
    setActiveSubCollection(sub);
    updateHistoryState(sub, newParent);
  };

  // Back to parent collection/subcollection
  const handleBackToParent = () => {
    if (parentLevel) {
      if (parentLevel.type === "collection") {
        // Go back to main collection
        setActiveSubCollection(null);
        setParentLevel(null);
        updateHistoryState(null, null);
      } else if (parentLevel.type === "subcollection") {
        // Go back to parent subcollection
        const parentSubCollection = findSubCollectionById(parentLevel.id);
        if (parentSubCollection) {
          // Find the parent of the parent subcollection
          const grandParent = findParentOfSubCollection(parentLevel.id);
          setActiveSubCollection(parentSubCollection);
          setParentLevel(grandParent);
          updateHistoryState(parentSubCollection, grandParent);
        } else {
          // Fallback to main collection
          setActiveSubCollection(null);
          setParentLevel(null);
          updateHistoryState(null, null);
        }
      }
    } else {
      // Fallback to main collection
      setActiveSubCollection(null);
      setParentLevel(null);
      updateHistoryState(null, null);
    }
  };

  // When a file is clicked, open modal with the current context's files
  const handleFileClick = (index: number) => {
    setModalFiles(displayFiles);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  // Close modal if context changes (e.g., navigating between main and subcollection)
  React.useEffect(() => {
    setIsModalOpen(false);
    setModalFiles([]);
    setCurrentIndex(0);
  }, [activeSubCollection]);

  const checkScrollPosition = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowTopGradient(scrollTop > 0);

      const downloadButtonHeight = 80;
      const hasContentOverflow = scrollTop + clientHeight < scrollHeight;
      const wouldOverlapButton =
        scrollHeight > clientHeight - downloadButtonHeight;

      setShowBottomGradient(hasContentOverflow && wouldOverlapButton);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCollectionData();
    }
  }, [slug]);

  // Set up browser navigation listeners
  useEffect(() => {
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [subCollections]);

  // Initialize history state on first load
  useEffect(() => {
    if (isInitialized && !window.history.state) {
      console.log("Setting initial history state");
      updateHistoryState(null, null);
    }
  }, [isInitialized]);

  // Restore navigation state after subcollections are loaded
  useEffect(() => {
    if (isInitialized && subCollections.length > 0) {
      const currentState = window.history.state as NavigationState | null;
      console.log("Checking for state restoration:", currentState);
      if (currentState?.activeSubCollectionId) {
        const subCollection = findSubCollectionById(
          currentState.activeSubCollectionId
        );
        if (subCollection) {
          setActiveSubCollection(subCollection);
          setParentLevel(currentState.parentLevel);
        } else {
          updateHistoryState(null, null);
        }
      }
    }
  }, [isInitialized, subCollections]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      checkScrollPosition();
      contentElement.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        contentElement.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [files]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getDisplayUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return { hostname: parsed.hostname, origin: parsed.origin };
    } catch (error) {
      return { hostname: "", origin: "" };
    }
  };

  // Determine which files and subcollections to show
  const displayFiles = activeSubCollection
    ? (activeSubCollection.attachmentDtos || []).map(convertAttachmentToMessage)
    : files;
  const displaySubCollections = activeSubCollection
    ? activeSubCollection.subCollections || []
    : subCollections;
  const displayTitle = activeSubCollection
    ? activeSubCollection.rootCollection?.name ||
      getDisplayUrl(activeSubCollection.rootCollection?.url).hostname ||
      "Untitled"
    : collectionTitle;
  const displayOwner = activeSubCollection ? collectionOwner : collectionOwner;
  const displayDate = activeSubCollection
    ? convertUnixNanoToReadable(activeSubCollection.rootCollection?.createdAt)
    : collectionDate;

  // Simplified Breadcrumb navigation - only shows immediate parent
  const BreadcrumbNav = () => {
    if (!activeSubCollection || !parentLevel) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 z-[100]">
        <button
          onClick={handleBackToParent}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>{parentLevel.name}</span>
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{displayTitle}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="rounded-2xl shadow-lg bg-gray-100 p-6 w-[260px] h-[260px] flex flex-col relative animate-pulse">
          {/* Title bar */}
          <div className="h-5 w-2/3 bg-gray-300 rounded mb-2" />
          {/* Subtitle */}
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-6" />
          {/* Overlapping image skeletons */}
          <div className="relative flex-1 flex items-end justify-center mt-2">
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-20 bg-gray-300 rounded-xl shadow-md"
              style={{
                zIndex: 3,
                transform: "translate(-50%, 0) rotate(-6deg)",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-4 w-32 h-20 bg-gray-200 rounded-xl shadow-md"
              style={{
                zIndex: 2,
                transform: "translate(-50%, 0) rotate(4deg)",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-8 w-32 h-20 bg-gray-100 rounded-xl shadow-md"
              style={{
                zIndex: 1,
                transform: "translate(-50%, 0) rotate(-2deg)",
              }}
            />
          </div>
          {/* Dots or menu icon (optional) */}
          <div className="absolute top-4 right-4 w-6 h-2 flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Fixed navbar at top */}
      <nav
        className={`fixed top-0 left-0 right-0 px-3 md:px-6 py-4 md:py-6 flex justify-between items-center z-50 transition-all duration-300 ${
          showTopGradient
            ? "h-28 bg-gradient-to-b from-white/90 via-gray-50/70 to-transparent pointer-events-none backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex justify-between items-center gap-4 max-w-screen-2xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="https://www.typo.inc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-11 h-11 justify-center items-center gap-2.5 flex-shrink-0 z-[100]"
            >
              <Image
                src={blackTypo}
                alt="Typo Logo"
                width={44}
                height={44}
                priority
              />
            </Link>
            <BreadcrumbNav />
          </div>
        </div>
      </nav>

      {/* Content area with gradient overlays */}
      <div className="flex-1 relative">
        {/* Bottom gradient overlay for download button area */}
        {showBottomGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 via-gray-50/70 to-transparent z-10 pointer-events-none backdrop-blur-sm" />
        )}

        {/* Scrollable content - takes full height with top padding for navbar */}
        <div
          className="p-6 pt-32 h-screen overflow-auto hide-scrollbar relative"
          ref={contentRef}
        >
          {displayFiles.length === 0 && displaySubCollections.length === 0 ? (
            <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg">
                  No files found in this collection
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-screen-2xl mx-auto w-full">
              {/* Show collection preview card when viewing main collection */}
              {!activeSubCollection && (
                <div className="flex flex-col items-center mb-6">
                  <CollectionPreviewCard
                    previewFiles={displayFiles.slice(0, 3)}
                    previewImages={displayFiles
                      .slice(0, 3)
                      .map(
                        (file: any) =>
                          file.content.optimisedImageUrl ||
                          file.content.thumbnailImage ||
                          file.cloudFrontDownloadLink
                      )}
                    hasSubCollections={displaySubCollections.length > 0}
                    subCollections={displaySubCollections}
                  />
                  <h2 className="font-semibold text-lg md:text-xl text-gray-900 mt-4 text-center">
                    {displayTitle}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>
                      {displayFiles.length + displaySubCollections.length} items
                    </span>
                    <span>•</span>
                    <span>{displayDate}</span>
                    <span>•</span>
                    <span>{displayOwner}</span>
                  </div>
                  <div className="mt-4">
                    <DownloadAllCollectionsButton
                      collectionTitle={displayTitle}
                      disabled={displayFiles.length === 0}
                      isSubCollection={!!activeSubCollection}
                      subCollectionId={activeSubCollection?.rootCollection?.id}
                      files={displayFiles}
                    />
                  </div>
                </div>
              )}

              {/* Show collection preview card when viewing subcollection */}
              {activeSubCollection && (
                <div className="flex flex-col items-center mb-6">
                  <CollectionPreviewCard
                    previewFiles={displayFiles.slice(0, 3)}
                    previewImages={displayFiles
                      .slice(0, 3)
                      .map(
                        (file: any) =>
                          file.content.optimisedImageUrl ||
                          file.content.thumbnailImage ||
                          file.cloudFrontDownloadLink
                      )}
                    hasSubCollections={displaySubCollections.length > 0}
                    subCollections={displaySubCollections}
                  />
                  <h2 className="font-semibold text-lg md:text-xl text-gray-900 mt-4 text-center">
                    {displayTitle}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>
                      {displayFiles.length + displaySubCollections.length} items
                    </span>
                    <span>•</span>
                    <span>{displayDate}</span>
                    <span>•</span>
                    <span>{displayOwner}</span>
                  </div>
                  <div className="mt-4">
                    <DownloadAllCollectionsButton
                      collectionTitle={displayTitle}
                      disabled={displayFiles.length === 0}
                      isSubCollection={!!activeSubCollection}
                      subCollectionId={activeSubCollection?.rootCollection?.id}
                      files={displayFiles}
                    />
                  </div>
                </div>
              )}

              {/* Files and subcollections grid */}
              <div className="flex flex-wrap gap-x-1 gap-y-2 md:gap-x-2 justify-center">
                {/* Render subcollections first */}
                {displaySubCollections.map((sub: any, idx: number) => {
                  const previewFiles = (sub.attachmentDtos || [])
                    .slice(0, 3)
                    .map(convertAttachmentToMessage);
                  const previewImages = previewFiles.map(
                    (file: any) =>
                      file.content.optimisedImageUrl ||
                      file.content.thumbnailImage ||
                      file.cloudFrontDownloadLink
                  );
                  const fileCount = (sub.attachmentDtos || []).length;
                  const subCollectionCount = (sub.subCollections || []).length;
                  const itemCount = fileCount + subCollectionCount;
                  const title =
                    sub.rootCollection?.name ||
                    getDisplayUrl(sub.rootCollection?.url).hostname ||
                    "Untitled";
                  return (
                    <SubCollectionCard
                      key={sub.rootCollection?.id || idx}
                      title={title}
                      itemCount={itemCount}
                      previewFiles={previewFiles}
                      previewImages={previewImages}
                      subCollections={sub.subCollections || []}
                      onClick={() => handleSubCollectionClick(sub)}
                    />
                  );
                })}
                {/* Render files */}
                {displayFiles.map((file: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => handleFileClick(idx)}
                    className="rounded-2xl bg-white border border-[#1919191A] shadow flex flex-col items-center justify-center relative w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px] cursor-pointer overflow-hidden"
                  >
                    <CollectionFilePreview
                      token={file}
                      onFileClick={() => handleFileClick(idx)}
                    />
                    <div className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap md:max-w-fit px-2 py-1 bg-[#EBEBEBBF] text-xs text-secondary rounded-full text-center border border-[#1919191A] absolute bottom-2 z-10">
                      {truncateFilename(
                        file.content.name ||
                          file.cloudFrontDownloadLink ||
                          getDisplayUrl(file.content.url).hostname ||
                          "Unknown file",
                        !isMobile
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for files or subcollection files */}
      <CollectionFileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        files={modalFiles}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
};

export default page;
