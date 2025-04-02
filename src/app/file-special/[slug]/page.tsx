"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UploadIcon } from "@/assets/uploadIcon";
import CountryCode from "@/components/CountryCode";
import FilePreview from "@/components/FilePreview";
import blackTypo from "@/assets/blackTypo.svg";
import videoIcon from "@/assets/videoIcon.svg";
import userIcon from "@/assets/user.svg";
import ticktock from "@/assets/ticktock.svg";
import { truncateFilename } from "@/components/TruncateText";
import axios from "axios";
import { useParams } from "next/navigation";
import { FileContent, FileData } from "@/utils/BubbleSpecialInterfaces";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_FILE_PREVIEW_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 w-full mx-auto">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#F3F3F3BF] text-primary px-4 py-3 rounded-2xl z-50 mx-auto flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}

function Page() {
  const { slug } = useParams();
  const [textValue, setTextValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({
    name: "",
    phone: "",
    countryCode: "",
    code: "",
  });
  const [showName, setShowName] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [bubbleData, setBubbleData] = useState<FileData | null>(null);
  const [exampleOutput, setExampleOutput] = useState<FileContent | null>(null);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const fetchBubbleData = async () => {
      try {
        const { data } = await axios.post(
          `${SPECIAL_BUBBLE_BASE_URL}/api/artifacts/details`,
          { artifactId: slug, isDev: true },
          { headers: { "x-user-id": USER_ID, accept: "*/*" } }
        );
        setBubbleData(data.artifact);
        setExampleOutput(data.artifact[0]);
      } catch (error) {
        console.error(error);
      }
    };

    if (slug) fetchBubbleData();
  }, [slug]);

  useEffect(() => {
    if (user.phone && user.countryCode && user.code) {
      setShowName(true);
    } else {
      setShowName(false);
    }
    if (user.name !== "") {
      setAllowSubmit(true);
    } else {
      setAllowSubmit(false);
    }
  }, [user]);

  const filename =
    bubbleData?.description || exampleOutput?.cloudFrontDownloadLink || "";
  const getFileExtension = (name: string) =>
    name.split(".").pop()?.toLowerCase() || "";
  const fileExtension = getFileExtension(filename);

  const isLink =
    exampleOutput?.type === "LINK" ||
    (!fileExtension &&
      (exampleOutput?.cloudFrontDownloadLink ?? "").startsWith("http"));
  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic|tif)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isPDF = /^pdf$/i.test(fileExtension);
  const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
  const isCSV = /^csv$/i.test(fileExtension);
  const isExcel = /^(xls|xlsx)$/i.test(fileExtension);
  const isJSON = /^json$/i.test(fileExtension);

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

  const uploadIconColor = textValue.trim() ? "black" : "#BABABA";

  const handleFocus = () => setIsKeyboardOpen(true);
  const handleBlur = () => setIsKeyboardOpen(false);

  const openModal = () => {
    if (textValue.trim() !== "") {
      setIsModalOpen(true);
    }
  };

  return (
    <div
      className={`max-w-screen-2xl mx-auto w-full flex flex-col justify-between pb-6 ${
        isKeyboardOpen ? "h-auto md:h-screen" : "h-screen"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center gap-4 shrink-0">
        <Link href="/">
          <Image src={blackTypo} alt="Typo" width={0} height={0} />
        </Link>
        <div className="bg-gradient-to-b from-[#7E7E7E] to-[#191919E5] rounded-full px-3 flex items-center gap-2">
          <Image src={videoIcon} alt="Video" width={0} height={0} />
          <span className="text-white text-sm font-light">
            {truncateFilename(bubbleData?.description || "", true)}
          </span>
        </div>
        <Image src={userIcon} alt="User" width={0} height={0} />
      </div>
      {/* Main content area */}
      <div className="min-h-[75vh] flex-grow flex justify-center items-center">
        <div className="w-full flex justify-center h-full">
          <FilePreview
            url={exampleOutput?.cloudFrontDownloadLink}
            filename={bubbleData?.title || ""}
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
            openImageModal={() => {
              /* Add image modal handler if needed */
            }}
            openPdfModal={() => {
              /* Add PDF modal handler if needed */
            }}
            thumbnailImage={bubbleData?.image || ""}
          />
        </div>
      </div>
      {/* Textarea and UploadIcon section */}
      <div className="mt-4 px-6 shrink-0">
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
      </div>
      {/* Modal with StepOneBottom */}
      {isModalOpen && (
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
      )}
    </div>
  );
}

export default Page;
