"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
// import { UploadIcon } from "@/assets/uploadIcon";
// import CountryCode from "@/components/CountryCode";
import FilePreview from "@/components/FilePreview";
import blackTypo from "@/assets/blackTypo.svg";
import videoIcon from "@/assets/videoIcon.svg";
// import ticktock from "@/assets/ticktock.svg";
import { truncateFilename } from "@/components/TruncateText";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { FileContent, FileData, BackendResponse, OwnerProfile, AttachedContent } from "@/utils/BubbleSpecialInterfaces";
import { getFileTypeIcon, getFileNameFromDescription } from "@/utils/getFileTypeIcon";
import DownloadButton from "@/components/DownloadButton";
// import LoadingState from "@/components/LoadingState";
import LoadingState, { FileKind } from '@/components/LoadingState';


const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_FILE_PREVIEW_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;


// function Modal({
//   children,
//   onClose,
// }: {
//   children: React.ReactNode;
//   onClose: () => void;
// }) {
//   return (
//     <div className="fixed inset-0 flex justify-center items-center z-50 w-full mx-auto">
//       <div
//         className="absolute inset-0 bg-black opacity-50"
//         onClick={onClose}
//       ></div>
//       <div className="relative bg-[#F3F3F3BF] text-primary px-4 py-3 rounded-2xl z-50 mx-auto flex justify-center items-center">
//         {children}
//       </div>
//     </div>
//   );
// }

const extToKind = (ext: string): FileKind => {
  console.log('extToKind called with extension:', ext);
  if (/^(jpg|jpeg|png|gif|bmp|webp|heic|tif)$/i.test(ext)) {
    console.log('extToKind returning: image');
    return 'image';
  }
  if (/^(mp4|webm|ogg|mov|avi|MOV)$/i.test(ext)) {
    console.log('extToKind returning: video');
    return 'video';
  }
  if (/^(mp3|wav|ogg|m4a)$/i.test(ext)) {
    console.log('extToKind returning: audio');
    return 'audio';
  }
  if (/^pdf$/i.test(ext)) {
    console.log('extToKind returning: pdf');
    return 'pdf';
  }
  if (/^(zip|rar|7z)$/i.test(ext)) {
    console.log('extToKind returning: zip');
    return 'zip';
  }
  if (/^json$/i.test(ext)) {
    console.log('extToKind returning: json');
    return 'json';
  }
  console.log('extToKind returning: doc (fallback)');
  return 'doc'; // fallback for everything else
};

const getFileExtension = (name: string) => {
  // Remove query parameters and hash from URL
  const cleanName = name.split('?')[0].split('#')[0];
  // Get the last part after the last dot
  const extension = cleanName.split(".").pop()?.toLowerCase() || "";
  console.log('getFileExtension debug:', { original: name, cleanName, extension });
  return extension;
};

function Page() {
  const { slug } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // const [textValue, setTextValue] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [user, setUser] = useState({
  //   name: "",
  //   phone: "",
  //   countryCode: "",
  //   code: "",
  // });
  // const [showName, setShowName] = useState(false);
  // const [allowSubmit, setAllowSubmit] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [exampleOutput, setExampleOutput] = useState<FileContent | null>(null);
  const [fileKind, setFileKind] = useState<FileKind| null>(null);
  const [showLoadingState, setShowLoadingState] = useState(true);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const fetchFileData = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/single-file/${slug}`,
          { headers: { "x-user-id": USER_ID, accept: "*/*" } }
        );
        console.log("API response:", data);
        setFileData(data);
        setExampleOutput(data.textAttachment);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchFileData();
  }, [slug]);

  useEffect(() => {
    if (!isLoading && !fileData) {
      router.replace("/not-found");
    }
  }, [fileData, isLoading, router]);
  
  // Update fileKind when fileData changes
  useEffect(() => {
    if (fileData?.textAttachment?.attachedContent?.name) {
      const newFileKind = extToKind(getFileExtension(fileData.textAttachment.attachedContent.name));
      console.log("useEffect: Setting fileKind to:", newFileKind, "from filename:", fileData.textAttachment.attachedContent.name);
      setFileKind(newFileKind);
      
      // Show loading state briefly with correct fileKind
      setShowLoadingState(true);
      setTimeout(() => {
        setShowLoadingState(false);
      },500); // Show for 0.5s for pshchology lol
    }
  }, [fileData]);
  
  // Disable scrolling for audio files
  useEffect(() => {
    if (!fileData) return;
    
    const fileName = fileData?.textAttachment?.attachedContent?.name || 
                     exampleOutput?.cloudFrontDownloadLink || 
                     fileData?.description || "";
    const fileExtension = getFileExtension(fileName);
    const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
    
    if (!isLoading && isAudio) {
      // Apply the same class that's used during audio scrubbing
      document.body.classList.add('scrubbing-active');
    } else {
      document.body.classList.remove('scrubbing-active');
    }
    
    return () => {
      document.body.classList.remove('scrubbing-active');
    };
  }, [isLoading, fileData, exampleOutput]);

  // Determine file kind for loading state
  const filename = fileData?.textAttachment?.attachedContent?.name || 
                   exampleOutput?.cloudFrontDownloadLink || 
                   fileData?.description || "";
  const fileExtension = getFileExtension(filename);

  // Debug logging
  console.log('Debug file detection:', {
    filename,
    fileExtension,
    fileKind,
    attachedContentName: fileData?.textAttachment?.attachedContent?.name,
    cloudFrontLink: exampleOutput?.cloudFrontDownloadLink,
    fileDataDescription: fileData?.description,
    isLoading,
    hasFileData: !!fileData
  });

    if (isLoading || !fileData) return null;
    if (!fileKind) return null;
    if (showLoadingState) {
      return <LoadingState fileKind={fileKind} />;
    }

  // File type checking variables
  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic|tif)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isPDF = /^pdf$/i.test(fileExtension);
  const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
  const isCSV = /^csv$/i.test(fileExtension);
  const isExcel = /^(xls|xlsx)$/i.test(fileExtension);
  const isJSON = /^json$/i.test(fileExtension);

  // useEffect(() => {
  //   if (user.phone && user.countryCode && user.code) {
  //     setShowName(true);
  //   } else {
  //     setShowName(false);
  //   }
  //   if (user.name !== "") {
  //     setAllowSubmit(true);
  //   } else {
  //     setAllowSubmit(false);
  //   }
  // }, [user]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const title = truncateFilename(
    getFileNameFromDescription(fileData.description),
    true
  );

  // const uploadIconColor = textValue.trim() ? "black" : "#BABABA";

  // const handleFocus = () => setIsKeyboardOpen(true);
  // const handleBlur = () => setIsKeyboardOpen(false);

  // const openModal = () => {
  //   if (textValue.trim() !== "") {
  //     setIsModalOpen(true);
  //   }
  // };

  return (
    <div
      className={`max-w-screen-2xl mx-auto w-full flex flex-col justify-between pb-6 ${
        isKeyboardOpen ? "h-auto md:h-screen" : "h-screen"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center gap-4 shrink-0">
        <Link href={`/file-special/${slug}`}>
          <Image src={blackTypo} alt="Typo" width={0} height={0} />
        </Link>
        <div className="bg-gradient-to-b from-[#7E7E7E] to-[#191919E5] rounded-full px-3 flex items-center gap-2">
          {fileData && (
            <>
              {getFileTypeIcon(fileData)?.iconType === 'url' ? (
                <div className="w-5 h-5 rounded-sm overflow-hidden flex-shrink-0">
                  <img 
                    src={getFileTypeIcon(fileData)?.iconUrl} 
                    alt={getFileTypeIcon(fileData)?.label || "File"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      // Fallback to the default icon if the image fails to load
                      e.currentTarget.src = getFileTypeIcon(fileData)?.icon?.src || videoIcon.src;
                    }}
                  />
                </div>
              ) : getFileTypeIcon(fileData)?.iconType === 'videoUrl' ? (
                <div className="w-5 h-5 rounded-sm overflow-hidden flex-shrink-0">
                  <video
                    className="w-full h-full object-cover"
                    preload="metadata"
                    playsInline
                    autoPlay
                    muted
                    loop
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      // Hide the video element on error and show fallback
                      e.currentTarget.style.display = 'none';
                      // Create and append fallback image
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const img = document.createElement('img');
                        img.src = getFileTypeIcon(fileData)?.icon?.src || videoIcon.src;
                        img.alt = getFileTypeIcon(fileData)?.label || "Video";
                        img.className = "w-full h-full object-cover";
                        parent.appendChild(img);
                      }
                    }}
                   >
                    <source
                      src={getFileTypeIcon(fileData)?.iconUrl}
                      type="video/mp4"
                    />
                    {/* Add additional sources if needed */}
                  </video>
                </div>
              ) : (
                <Image 
                  src={getFileTypeIcon(fileData)?.icon || videoIcon} 
                  alt={getFileTypeIcon(fileData)?.label || "File"} 
                  width={0} 
                  height={0} 
                />
              )}
              <span className="text-white text-sm font-light">
                {fileData?.description ? title : "Loading..."}
              </span>
            </>
          )}
          {!fileData && (
            <>
              <Image src={videoIcon} alt="File" width={0} height={0} />
              <span className="text-white text-sm font-light">Loading...</span>
            </>
          )}
        </div>
        <DownloadButton
          downloadLink={exampleOutput?.cloudFrontDownloadLink || ""}
          fileName={title}
        />
      </div>
      {/* Main content area */}
      <div className="min-h-[75vh] flex-grow flex justify-center items-center">
        <div className="w-full flex justify-center h-full">
          <FilePreview
            url={exampleOutput?.cloudFrontDownloadLink}
            filename={fileData?.title || ""}
            fileExtension={
              exampleOutput?.cloudFrontDownloadLink
                .split(".")
                .pop()
                ?.toLowerCase() || ""
            }
            token={exampleOutput}
            isImage={isImage}
            isVideo={isVideo}
            isAudio={isAudio}
            isPDF={isPDF}
            isZip={isZip}
            isCSV={isCSV}
            isExcel={isExcel}
            isJSON={isJSON}
            formatFileSize={formatFileSize}
            title={title}
            optimisedImageUrl={fileData.textAttachment.optimisedImageUrl}
            openImageModal={() => {
              /* Add image modal handler if needed */
            }}
            openPdfModal={() => {
              /* Add PDF modal handler if needed */
            }}
            thumbnailImage={fileData?.image || ""}
          />
        </div>
      </div>
      {/* Textarea and UploadIcon section */}
      {/* <div className="mt-4 px-6 shrink-0">
        <div className="bg-[#F0F0F0] rounded-2xl border border-[#EBEBEBBF] pb-2">
          <textarea
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="bg-transparent w-full resize-none outline-none px-4 py-2 font-light"
            rows={1}
            placeholder="Make a typo..."
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <div className="px-4 w-full flex items-center justify-between">
            <Image src={ticktock} alt="Ticktock" width={0} height={0} />
            <div
              onClick={openModal}
              className={`${
                textValue.trim() ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              <UploadIcon color={uploadIconColor} />
            </div>
          </div>
        </div>
      </div> */}
      {/* Modal with StepOneBottom */}
      {/* {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col max-w-[360px]">
            <h2 className="text-primary font-medium text-[17px] max-w-xs w-full text-center">
              Sign in to let Bardi know who you are
            </h2>
            <CountryCode user={user} setUser={setUser} />
            <input
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => setUser({ ...user, code: e.target.value })}
              placeholder="Enter OTP"
              className="rounded-3xl bg-white p-2 px-4 w-full text-primary placeholder:text-[#7E7E7E] outline-none"
            />
            {showName && (
              <input
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="What's your name?"
                className="rounded-3xl bg-white p-2 px-4 w-full text-primary placeholder:text-[#7E7E7E] outline-none mt-4"
              />
            )}
            <button
              disabled={!allowSubmit}
              className={`${
                allowSubmit ? "bg-secondary" : "bg-[#6D87D2]"
              } text-white rounded-3xl py-2.5 my-4 relative`}
              onClick={() => {
                setTextValue("");
                setUser({
                  name: "",
                  phone: "",
                  countryCode: "",
                  code: "",
                });
                alert("Reply sent successfully!");
                setIsModalOpen(false);
              }}
            >
              Send reply
              <span className="absolute right-2 bottom-2">
                <UploadIcon color="white" />
              </span>
            </button>
            <p
              onClick={() => setIsModalOpen(false)}
              className="text-center text-[15px] text-[#191919] font-medium cursor-pointer w-fit mx-auto"
            >
              Cancel
            </p>
          </div>
        </Modal>
      )} */}
    </div>
  );
}

export default Page;