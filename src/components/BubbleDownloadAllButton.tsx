import * as React from "react";
import Image from "next/image";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import { useParams } from "next/navigation";

interface DownloadAllButtonProps {
  attachments: Message[];
}

const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({
  attachments,
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const params = useParams();

  const handleDownloadAll = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isDownloading) return;
    setIsDownloading(true);
    setError(null);

    try {
      // Get publicId from the URL path
      const publicId = params.slug as string;
      if (!publicId) {
        throw new Error("Message ID not found in URL");
      }

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webClient/message/${publicId}/download-files`;

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
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleDownloadAll}
        disabled={isDownloading}
        className="font-medium text-sm bg-gradient-blue text-white px-4 py-2.5 flex rounded-full justify-center items-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Image src={whiteDownloadIcon} alt="Download All" />
        {isDownloading ? "Downloading..." : "Download all files"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default DownloadAllButton;
