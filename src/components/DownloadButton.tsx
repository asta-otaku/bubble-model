import * as React from "react";
import Image from "next/image";
import downloadIcon from "@/assets/filledDownload.svg";
import useIsMobile from "@/utils";
import { useParams } from "next/navigation";

interface DownloadButtonProps {
  downloadLink: string;
  fileName: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  downloadLink,
  fileName,
}) => {
  const isMobile = useIsMobile();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const params = useParams();
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isDownloading) return;
    setIsDownloading(true);

  try {
    const publicId = params.slug as string;
    if (!publicId) throw new Error("Message ID not found");

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webClient/single-file/${publicId}/download`;

    // Kick off download in new tab
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setIsDownloading(false);
  }
};

  return (
    <>
      {isMobile ? (
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-transparent border-0 p-0 cursor-pointer"
        >
          <Image
            src={downloadIcon}
            alt="Download"
            width={0}
            height={0}
            className="w-6 h-8"
          />
        </button>
      ) : (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="font-medium text-sm border border-[#1919191A] bg-[#E8E8E8] text-[#3076FF] px-4 py-2.5 flex rounded-full justify-center items-center gap-3"
        >
          <Image src={downloadIcon} alt="Download" />
          {isDownloading ? "Downloading..." : "Download"}
        </button>
      )}
    </>
  );
};

export default DownloadButton;