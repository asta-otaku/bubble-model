"use client";

import FloatingNav from "@/components/FloatingNav";
import React, { useEffect, useState } from "react";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import Image from "next/image";
import { truncateFilename } from "@/components/TruncateText";
import useIsMobile from "@/utils";
import axios from "axios";
import { useParams } from "next/navigation";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import CollectionFilePreview from "@/components/CollectionFilePreview";
import CollectionImageModal from "@/components/CollectionImageModal";

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

  useEffect(() => {
    if (slug) {
      fetchFiles();
      fetchCollectionInfo();
    }
  }, [slug]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Filter only image files for the modal
  const imageFiles = files.filter((file) => {
    const filename = file.content.name || file.cloudFrontDownloadLink || "";
    const fileExtension = filename.split(".").pop()?.toLowerCase() || "";
    return /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(fileExtension);
  });

  // Find the index of the clicked image in the filtered array
  const getImageIndex = (fileIndex: number) => {
    return imageFiles.findIndex((img) => img === files[fileIndex]);
  };

  const handleImageClick = (index: number) => {
    const imageIndex = getImageIndex(index);
    if (imageIndex !== -1) {
      setCurrentIndex(imageIndex);
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <FloatingNav
        isCollection
        title={collectionTitle}
        name={collectionOwner}
        date={collectionDate}
        numItems={files.length}
      />
      <div className="flex-1 p-6 my-12 md:my-24">
        {files.length === 0 ? (
          <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                No files found in this collection
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-screen-2xl mx-auto w-full flex flex-wrap gap-x-1 gap-y-2 md:gap-x-2 justify-center">
            {files.map((file, idx) => {
              const filename =
                file.content.name || file.cloudFrontDownloadLink || "";
              const fileExtension =
                filename.split(".").pop()?.toLowerCase() || "";
              const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(
                fileExtension
              );

              return (
                <div
                  key={idx}
                  onClick={() => (isImage ? handleImageClick(idx) : undefined)}
                  className="rounded-2xl bg-white border border-[#1919191A] shadow flex flex-col items-center justify-center relative w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px]"
                >
                  <CollectionFilePreview
                    token={file}
                    onFileClick={
                      isImage ? () => handleImageClick(idx) : undefined
                    }
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
              );
            })}
          </div>
        )}
      </div>
      <div className="w-full flex justify-center py-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white max-w-xs w-full justify-center px-8 py-3 rounded-full text-base shadow-md transition flex items-center gap-2">
          <Image src={whiteDownloadIcon} alt="Download all" />
          Download all
        </button>
      </div>

      {/* Single modal instance for all images */}
      <CollectionImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        images={imageFiles}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
};

export default page;
