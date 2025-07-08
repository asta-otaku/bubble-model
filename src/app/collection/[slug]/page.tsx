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
import { Message } from "@/utils/BubbleSpecialInterfaces";
import CollectionFilePreview from "@/components/CollectionFilePreview";
import CollectionFileModal from "@/components/CollectionFileModal";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_COLLECTION_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

const page = () => {
  const { slug } = useParams();
  const [files, setFiles] = useState<Message[]>([]);
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

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/collection/${slug}/files`,
        {
          headers: { "x-user-id": USER_ID, accept: "*/*" },
        }
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching collection files:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCollectionInfo = async () => {
    try {
      const response = await axios.get(
        `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/collection/${slug}`,
        {
          headers: { "x-user-id": USER_ID, accept: "*/*" },
        }
      );

      const collectionData = response.data;
      setCollectionTitle(
        collectionData.title || collectionData.folderName || "Collection"
      );
      setCollectionOwner(
        `${collectionData.ownerProfile?.firstName || ""} ${
          collectionData.ownerProfile?.lastName || ""
        }`.trim() || "Unknown"
      );
      setCollectionDate(
        new Date(collectionData.createdAt || Date.now()).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        )
      );
    } catch (error) {
      console.error("Error fetching collection info:", error);
    }
  };

  const handleFileClick = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const checkScrollPosition = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowTopGradient(scrollTop > 0);

      // Calculate if content extends into the download button area
      // Download button area is roughly 80px high (button + padding)
      const downloadButtonHeight = 80;
      const hasContentOverflow = scrollTop + clientHeight < scrollHeight;
      const wouldOverlapButton =
        scrollHeight > clientHeight - downloadButtonHeight;

      setShowBottomGradient(hasContentOverflow && wouldOverlapButton);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchFiles();
      fetchCollectionInfo();
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
              {collectionTitle}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-semibold">
                {collectionOwner}
              </span>
              <span className="text-xs text-primary font-mono">•</span>
              <span className="text-xs text-[#7E7E7E] font-mono">
                {files.length} items
              </span>
              <span className="text-xs text-primary font-mono">•</span>
              <span className="text-xs text-[#7E7E7E] font-mono">
                {collectionDate}
              </span>
            </div>
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
          className="p-6 pt-32 h-screen overflow-auto hide-scrollbar relative pb-20"
          ref={contentRef}
        >
          {files.length === 0 ? (
            <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg">
                  No files found in this collection
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-screen-2xl mx-auto w-full flex flex-wrap gap-x-1 gap-y-2 md:gap-x-2 justify-center">
              {files.map((file, idx) => (
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

      {/* Fixed download button at bottom */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20">
        <button className="bg-blue-600 hover:bg-blue-700 text-white max-w-xs w-full justify-center px-8 py-3 rounded-full text-base shadow-md transition flex items-center gap-2 mx-6">
          <Image src={whiteDownloadIcon} alt="Download all" />
          Download all
        </button>
      </div>

      {/* Single modal instance for all files */}
      <CollectionFileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        files={files}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
};

export default page;
