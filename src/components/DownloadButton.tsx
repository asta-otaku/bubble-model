import * as React from "react";
import Image from "next/image";
import downloadIcon from "@/assets/filledDownload.svg";
import useIsMobile from "@/utils";

interface DownloadButtonProps {
  downloadLink: string;
  fileName: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  downloadLink,
  fileName,
}) => {
  const isMobile = useIsMobile();
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(downloadLink, { mode: "cors" });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      {isMobile ? (
        <a href={downloadLink} onClick={handleDownload}>
          <Image
            src={downloadIcon}
            alt="Download"
            width={0}
            height={0}
            className="w-6 h-8"
          />
        </a>
      ) : (
        <a
          href={downloadLink}
          onClick={handleDownload}
          className="font-medium text-sm border border-[#1919191A] bg-[#E8E8E8] text-[#3076FF] px-4 py-2.5 flex rounded-full justify-center items-center gap-3"
        >
          <Image src={downloadIcon} alt="Download" />
          Download
        </a>
      )}
    </>
  );
};

export default DownloadButton;
