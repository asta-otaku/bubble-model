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
  const [isDownloading, setIsDownloading] = React.useState(false);
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isDownloading) return;
    setIsDownloading(true);
    
    // Instead of handling the download logic in the browser,
    // redirect to our API endpoint that will set the proper headers
    const encodedUrl = encodeURIComponent(downloadLink);
    const encodedFileName = encodeURIComponent(fileName);
    const downloadUrl = `/api/download?url=${encodedUrl}&filename=${encodedFileName}`;
    
    // Create an invisible iframe to avoid navigating away from the current page
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    
    // Set a timeout to remove the iframe and reset the loading state
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      setIsDownloading(false);
    }, 2000);
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