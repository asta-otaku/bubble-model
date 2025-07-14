"use client";

import React, { useEffect, useState } from "react";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import blackTypo from "@/assets/blackTypo.svg";
import Image from "next/image";
import Link from "next/link";
import { truncateFilename } from "@/components/TruncateText";
import useIsMobile from "@/utils";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Message,
  NewCollectionResponse,
  AttachmentDto,
} from "@/utils/BubbleSpecialInterfaces";
import CollectionFilePreview from "@/components/CollectionFilePreview";
import CollectionFileModal from "@/components/CollectionFileModal";
import SubCollectionCard from "@/components/SubCollectionCard";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_COLLECTION_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

const page = () => {
  const { slug } = useParams();
  const [files, setFiles] = useState<Message[]>([]);
  const [subCollections, setSubCollections] = useState<any[]>([]); // Store subcollections
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
  const [modalFiles, setModalFiles] = useState<Message[]>([]); // For modal file list
  const [activeSubCollection, setActiveSubCollection] = useState<any | null>(
    null
  );

  // Helper function to convert AttachmentDto to Message format
  const convertAttachmentToMessage = (attachment: AttachmentDto): Message => {
    return {
      index: attachment.textAttachment.index,
      type: "FILE",
      cloudFrontDownloadLink: attachment.textAttachment.cloudFrontDownloadLink,
      optimisedImageUrl: attachment.textAttachment.optimisedImageUrl,
      metaData: attachment.textAttachment.metaData,
      muxDetailsForWebclient:
        attachment.textAttachment.muxDetailsForWebclient || undefined,
      content: {
        contentId: attachment.textAttachment.attachedContent.id,
        startTime: 0,
        referencedAttachment: {
          thumbnailImage:
            attachment.textAttachment.attachedContent.thumbnailImage,
          name: attachment.textAttachment.attachedContent.name,
          size: attachment.textAttachment.attachedContent.size,
          width: attachment.textAttachment.attachedContent.width,
          height: attachment.textAttachment.attachedContent.height,
          muxPlaybackId:
            attachment.textAttachment.attachedContent.muxPlaybackId || "",
          muxDetailsForWebclient:
            attachment.textAttachment.muxDetailsForWebclient || undefined,
          id: attachment.textAttachment.attachedContent.id,
          url: attachment.textAttachment.cloudFrontDownloadLink,
          optimisedImageUrl: attachment.textAttachment.optimisedImageUrl,
        },
        thumbnailImage:
          attachment.textAttachment.attachedContent.thumbnailImage,
        name: attachment.textAttachment.attachedContent.name,
        size: attachment.textAttachment.attachedContent.size,
        width: attachment.textAttachment.attachedContent.width,
        height: attachment.textAttachment.attachedContent.height,
        muxPlaybackId:
          attachment.textAttachment.attachedContent.muxPlaybackId || "",
        muxDetailsForWebclient:
          attachment.textAttachment.muxDetailsForWebclient || undefined,
        id: attachment.textAttachment.attachedContent.id,
        url: attachment.textAttachment.cloudFrontDownloadLink,
        userId: "",
        optimisedImageUrl: attachment.textAttachment.optimisedImageUrl,
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

  // Helper to extract subcollections recursively (flat list)
  const extractSubCollections = (collectionDto: any): any[] => {
    let allSubs: any[] = [];
    if (collectionDto.subCollections) {
      allSubs = [...allSubs, ...collectionDto.subCollections];
      collectionDto.subCollections.forEach((sub: any) => {
        allSubs = [...allSubs, ...extractSubCollections(sub)];
      });
    }
    return allSubs;
  };

  const fetchCollectionData = async () => {
    try {
      setIsLoading(true);
      // Use POST request with slug in the body
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

      // Only use the root collection's own files for the main view
      const rootAttachmentDtos =
        collectionData.webClientCollectionDto.attachmentDtos || [];
      // Sort by lastUpdatedTime (descending)
      rootAttachmentDtos.sort((a, b) => {
        const aTime = a.textAttachment.attachedContent.lastUpdatedTime || 0;
        const bTime = b.textAttachment.attachedContent.lastUpdatedTime || 0;
        return bTime - aTime;
      });
      // Convert attachments to Message format
      const convertedFiles = rootAttachmentDtos.map(convertAttachmentToMessage);
      setFiles(convertedFiles);

      // Set collection info
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
        new Date(
          collectionData.webClientCollectionDto.rootCollection.createdAt /
            1000000
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
      // Extract subcollections (flat list)
      let extractedSubs = extractSubCollections(
        collectionData.webClientCollectionDto
      );
      // Sort subcollections by lastUpdatedTime (descending)
      extractedSubs.sort((a, b) => {
        const aTime = a.rootCollection?.lastUpdatedTime || 0;
        const bTime = b.rootCollection?.lastUpdatedTime || 0;
        return bTime - aTime;
      });
      setSubCollections(extractedSubs);
    } catch (error) {
      console.error("Error fetching collection data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // When a subcollection card is clicked, show its contents in-place
  const handleSubCollectionClick = (sub: any) => {
    setActiveSubCollection(sub);
  };

  // Back to parent collection
  const handleBackToParent = () => {
    setActiveSubCollection(null);
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

  const handleDownloadAll = async () => {
    if (files.length === 0) return;

    try {
      // Prepare files array for the download-zip API
      const filesForDownload = files.map((file) => ({
        url: file.cloudFrontDownloadLink,
        name: file.content.name || `file-${file.index + 1}`,
      }));

      // Call the download-zip API
      const response = await fetch("/api/download-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: filesForDownload }),
      });

      if (!response.ok) {
        throw new Error("Failed to create zip file");
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collectionTitle}-files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading all files:", error);
      // You could add a toast notification here to inform the user of the error
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
    ? activeSubCollection.rootCollection?.name || "Untitled"
    : collectionTitle;
  const displayOwner = activeSubCollection
    ? collectionOwner // Or use subcollection owner if available
    : collectionOwner;
  const displayDate = activeSubCollection
    ? new Date(
        activeSubCollection.rootCollection?.createdAt / 1000000
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : collectionDate;

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
        <div className="flex items-center gap-4 max-w-screen-2xl mx-auto w-full">
          <Link
            href="https://www.typo.inc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-11 h-11 justify-center items-center gap-2.5 flex-shrink-0"
          >
            <Image
              src={blackTypo}
              alt="Typo Logo"
              width={44}
              height={44}
              priority
            />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-lg md:text-[22px] line-clamp-1 text-primary">
              {displayTitle}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-semibold">
                {displayOwner}
              </span>
              <span className="text-xs text-primary font-mono">•</span>
              <span className="text-xs text-[#7E7E7E] font-mono">
                {displayFiles.length} items
              </span>
              <span className="text-xs text-primary font-mono">•</span>
              <span className="text-xs text-[#7E7E7E] font-mono">
                {displayDate}
              </span>
            </div>
          </div>
        </div>
        {activeSubCollection && (
          <button
            onClick={handleBackToParent}
            className="ml-4 px-4 py-2 bg-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-300 transition"
          >
            ← Back
          </button>
        )}
      </nav>

      {/* Content area with gradient overlays */}
      <div className="flex-1 relative">
        {/* Bottom gradient overlay for download button area */}
        {showBottomGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 via-gray-50/70 to-transparent z-10 pointer-events-none backdrop-blur-sm" />
        )}

        {/* Scrollable content - takes full height with top padding for navbar */}
        <div
          className="p-6 pt-32 h-screen overflow-auto hide-scrollbar relative pb-24"
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
            <div className="max-w-screen-2xl mx-auto w-full flex flex-wrap gap-x-1 gap-y-2 md:gap-x-2 justify-center">
              {/* Render subcollections first */}
              {displaySubCollections.map((sub: any, idx: number) => {
                // Get up to 3 preview images from subcollection's attachments
                const previewImages = (sub.attachmentDtos || [])
                  .slice(0, 3)
                  .map(
                    (att: any) =>
                      att.textAttachment.optimisedImageUrl ||
                      att.textAttachment.cloudFrontDownloadLink
                  );
                const itemCount = (sub.attachmentDtos || []).length;
                const title = sub.rootCollection?.name || "Untitled";
                return (
                  <SubCollectionCard
                    key={sub.rootCollection?.id || idx}
                    title={title}
                    itemCount={itemCount}
                    previewImages={previewImages}
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
                        "Unknown file",
                      !isMobile
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed download button at bottom - always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* Background gradient for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent h-20 pointer-events-none" />

        {/* Button container */}
        <div className="relative flex justify-center pb-3 pt-3 pointer-events-auto">
          <button
            onClick={handleDownloadAll}
            className="bg-blue-600 hover:bg-blue-700 text-white max-w-xs w-full justify-center px-8 py-3 rounded-full text-base shadow-lg transition flex items-center gap-2 mx-6"
          >
            <Image src={whiteDownloadIcon} alt="Download all" />
            Download all
          </button>
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
