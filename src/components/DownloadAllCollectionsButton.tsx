import * as React from "react";
import Image from "next/image";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import { useParams } from "next/navigation";

interface DownloadAllCollectionsButtonProps {
  collectionTitle?: string;
  disabled?: boolean;
  isSubCollection?: boolean;
  subCollectionId?: string;
  files?: any[];
}

const DownloadAllCollectionsButton: React.FC<DownloadAllCollectionsButtonProps> = ({
  collectionTitle = "Collection",
  disabled = false,
  isSubCollection = false,
  subCollectionId,
  files = [],
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const params = useParams();

  const handleDownloadAll = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isDownloading || disabled) return;
    setIsDownloading(true);
    setError(null);

    try {
      const slug = params.slug as string;
      if (!slug) {
        throw new Error("Collection ID not found in URL");
      }

      const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_COLLECTION_URL;
      
      let url: string;
      
      if (isSubCollection && subCollectionId) {
        url = `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/collection/${slug}/subcollection/${subCollectionId}/download-files`;
      } else {
        url = `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/collection/${slug}/download-files`;
      }

      // Kick off download in new tab
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading all files:", error);
      setError("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleDownloadAll}
        disabled={isDownloading || disabled}
        className="bg-blue-600 hover:bg-blue-700 text-white max-w-xs w-full justify-center px-8 py-3 rounded-full text-base shadow-lg transition flex items-center gap-2 mx-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Image src={whiteDownloadIcon} alt="Download all" />
        {isDownloading ? "Downloading..." : `Download ${isSubCollection ? "all" : "all"}`}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default DownloadAllCollectionsButton; 