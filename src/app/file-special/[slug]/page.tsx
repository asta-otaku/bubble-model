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

const output = [
  {
    textAttachment: {
      index: 20,
      type: "FILE",
      attachedContent: {
        id: "d4517880-d924-4b1f-bcf1-1e59081b503a",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/d4517880-d924-4b1f-bcf1-1e59081b503a/IMG_0002.jpeg",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "ba084979-7b37-465e-83fe-b627340556ed",
    streamId: "a1d6a69e-8870-47e3-b616-9c28df8866cd",
    title: "2 Kelton shared a file with you",
    description: "File: IMG_0002.jpeg",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/ba084979-7b37-465e-83fe-b627340556ed.png",
  },

  {
    textAttachment: {
      index: 0,
      type: "FILE",
      attachedContent: {
        id: "b29404da-568b-4dc7-baea-1450ea25fc94",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/b29404da-568b-4dc7-baea-1450ea25fc94/IMG_6598-6795AE2F-4007-4301-BC38-2C73CEE5E1FF.heic",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "1a822f28-e717-438d-95cd-0f34ca466842",
    streamId: "a1d6a69e-8870-47e3-b616-9c28df8866cd",
    title: "2 Kelton shared a file with you",
    description: "File: IMG_6598-6795AE2F-4007-4301-BC38-2C73CEE5E1FF.heic",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/1a822f28-e717-438d-95cd-0f34ca466842.png",
  },

  {
    textAttachment: {
      index: 2,
      type: "FILE",
      attachedContent: {
        id: "877203e4-dc05-4f8e-ad54-676a1fcdd98f",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/877203e4-dc05-4f8e-ad54-676a1fcdd98f/IMG_6214-9C8AFCBC-2D48-403D-99AA-EB48F5877E43.mov",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "5135e71e-98f1-4c11-9cba-3a38ae32f791",
    streamId: "a1d6a69e-8870-47e3-b616-9c28df8866cd",
    title: "2 Kelton shared a file with you",
    description: "File: IMG_6214-9C8AFCBC-2D48-403D-99AA-EB48F5877E43.mov",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/5135e71e-98f1-4c11-9cba-3a38ae32f791.png",
  },

  {
    textAttachment: {
      index: 0,
      type: "FILE",
      attachedContent: {
        id: "9839a773-6526-4954-a2be-eee53c103e49",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/9839a773-6526-4954-a2be-eee53c103e49/mp4test1-01AAE41A-FF7D-40BB-80A3-CBD4DBF0EBDC.mp4",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "5135e71e-98f1-4c11-9cba-3a38ae32f791",
    streamId: "a1d6a69e-8870-47e3-b616-9c28df8866cd",
    title: "2 Kelton shared a file with you",
    description: "File: mp4test1-01AAE41A-FF7D-40BB-80A3-CBD4DBF0EBDC.mp4",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/5135e71e-98f1-4c11-9cba-3a38ae32f791.png",
  },
  {
    textAttachment: {
      index: 0,
      type: "FILE",
      attachedContent: {
        id: "639d5d1a-849a-4f5b-99dc-6e3a12aad477",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/639d5d1a-849a-4f5b-99dc-6e3a12aad477/gif2-7904BFF7-8D9A-471D-976F-F0BB42F08040.gif",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "1a12e4ae-bb97-4bc5-bd3a-18e1c64a269d",
    streamId: "a1d6a69e-8870-47e3-b616-9c28df8866cd",
    title: "2 Kelton shared a file with you",
    description: "File: gif2-7904BFF7-8D9A-471D-976F-F0BB42F08040.gif",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/1a12e4ae-bb97-4bc5-bd3a-18e1c64a269d.png",
  },
  {
    textAttachment: {
      index: 112,
      type: "FILE",
      attachedContent: {
        id: "66c84df9-a519-476d-8daf-60e8840b590c",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/66c84df9-a519-476d-8daf-60e8840b590c/Salter_Light Years.pdf",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "e626ef25-811d-4578-be89-21dabe39cbe9",
    streamId: "ee3f636e-42f1-42e1-acde-1b32bb7b817e",
    title: "2 Kelton shared a file with you",
    description: "File: Salter_Light Years.pdf",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/e626ef25-811d-4578-be89-21dabe39cbe9.png",
  },
  {
    textAttachment: {
      index: 42,
      type: "FILE",
      attachedContent: {
        id: "a8cff989-105f-46d7-b746-8d3912e8624f",
      },
      cloudFrontDownloadLink:
        "https://da0hzjj0t72aj.cloudfront.net/a8cff989-105f-46d7-b746-8d3912e8624f/1hour_HegelsPhenomenologyofSpirit.mp3",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "e626ef25-811d-4578-be89-21dabe39cbe9",
    streamId: "ee3f636e-42f1-42e1-acde-1b32bb7b817e",
    title: "2 Kelton shared a file with you",
    description: "File: 1hour_HegelsPhenomenologyofSpirit.mp3",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/e626ef25-811d-4578-be89-21dabe39cbe9.png",
  },

  {
    textAttachment: {
      index: 24,
      type: "FILE",
      attachedContent: {
        id: "f71f6db3-badb-4a9c-8074-3deee13d5092",
      },
      cloudFrontDownloadLink:
        "https://d28nmw8joqfmpg.cloudfront.net/30b970e8-4b42-4a82-b671-9d2f410d499a/mp3test2.mp3",
      metaData: null,
    },
    ownerProfile: {
      id: "717d854d-ee90-43a8-9a30-442954d09b79",
      firstName: "2 Kelton",
      lastName: "Reichert",
      phoneNumber: "+12222222222",
      lastUpdatedTime: 0,
      isShadowProfile: false,
    },
    publicItemId: "e626ef25-811d-4578-be89-21dabe39cbe9",
    streamId: "ee3f636e-42f1-42e1-acde-1b32bb7b817e",
    title: "2 Kelton shared a file with you",
    description: "File: CantinaBand60.wav",
    image:
      "https://da0hzjj0t72aj.cloudfront.net/metadata-images/e626ef25-811d-4578-be89-21dabe39cbe9.png",
  },
];

// Select the output to display
const exampleOutput = output[7];

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

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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
    exampleOutput.description ||
    exampleOutput.textAttachment.cloudFrontDownloadLink ||
    "";
  const getFileExtension = (name: string) =>
    name.split(".").pop()?.toLowerCase() || "";
  const fileExtension = getFileExtension(filename);

  const isLink =
    exampleOutput.textAttachment.type === "LINK" ||
    (!fileExtension &&
      (exampleOutput.textAttachment.cloudFrontDownloadLink ?? "").startsWith(
        "http"
      ));
  const isImage = /^(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(fileExtension);
  const isVideo = /^(mp4|webm|ogg|mov|avi|MOV)$/i.test(fileExtension);
  const isAudio = /^(mp3|wav|ogg|m4a)$/i.test(fileExtension);
  const isPDF = /^pdf$/i.test(fileExtension);
  const isZip = /^(zip|rar|7z)$/i.test(fileExtension);
  const isCSV = /^csv$/i.test(fileExtension);
  const isExcel = /^(xls|xlsx)$/i.test(fileExtension);

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
            {truncateFilename(exampleOutput.description, true)}
          </span>
        </div>
        <Image src={userIcon} alt="User" width={0} height={0} />
      </div>
      {/* Main content area */}
      <div className="min-h-[75vh] flex-grow flex justify-center items-center">
        <div className="w-full flex justify-center h-full">
          <FilePreview
            url={exampleOutput.textAttachment.cloudFrontDownloadLink}
            filename={exampleOutput.title}
            fileExtension={
              exampleOutput.textAttachment.cloudFrontDownloadLink
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
            formatFileSize={formatFileSize}
            openImageModal={() => {
              /* Add image modal handler if needed */
            }}
            openPdfModal={() => {
              /* Add PDF modal handler if needed */
            }}
            thumbnailImage={exampleOutput.image}
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
