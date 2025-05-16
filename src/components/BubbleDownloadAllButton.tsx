import * as React from "react";
import Image from "next/image";
import whiteDownloadIcon from "@/assets/whiteDownloadIcon.svg";
import { Message } from "@/utils/BubbleSpecialInterfaces";
import JSZip, { JSZipObject } from "jszip";

interface DownloadAllButtonProps {
  attachments: Message[];
}

const CHUNK_SIZE = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({
  attachments,
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [currentFile, setCurrentFile] = React.useState<string | null>(null);
  const [currentChunk, setCurrentChunk] = React.useState(0);
  const [totalChunks, setTotalChunks] = React.useState(0);

  const downloadChunk = async (
    files: Array<{ url: string; name: string }>,
    chunkIndex: number
  ) => {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, files.length);
    const chunk = files.slice(start, end);

    console.log(
      `Downloading chunk ${chunkIndex + 1}/${totalChunks} (${
        chunk.length
      } files)`
    );

    const response = await fetch("/api/download-zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: chunk }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create zip file");
    }

    const blob = await response.blob();
    return blob;
  };

  const handleDownloadAll = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isDownloading) return;
    setIsDownloading(true);
    setProgress(0);
    setError(null);
    setCurrentFile(null);
    setCurrentChunk(0);

    try {
      // Filter out invalid attachments and prepare files array
      const files = attachments
        .filter((attachment) => {
          const hasValidUrl = attachment.cloudFrontDownloadLink;
          if (!hasValidUrl) {
            console.warn(
              `Skipping attachment without valid URL: ${attachment.content.name}`
            );
          }
          return hasValidUrl;
        })
        .map((attachment) => ({
          url: attachment.cloudFrontDownloadLink,
          name: attachment.content.name || "unnamed-file",
        }));

      if (files.length === 0) {
        throw new Error("No valid files to download");
      }

      // Calculate total chunks
      const chunks = Math.ceil(files.length / CHUNK_SIZE);
      setTotalChunks(chunks);
      console.log(`Total files: ${files.length}, Chunks: ${chunks}`);

      // Download each chunk
      const blobs: Blob[] = [];
      for (let i = 0; i < chunks; i++) {
        setCurrentChunk(i + 1);
        console.log(
          `Processing chunk ${i + 1} of ${chunks} (${
            files.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE).length
          } files)`
        );
        setCurrentFile(`Downloading files...`);

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            const blob = await downloadChunk(files, i);
            blobs.push(blob);
            setProgress(Math.round(((i + 1) / chunks) * 100));
            break;
          } catch (error) {
            retries++;
            if (retries === MAX_RETRIES) throw error;
            console.log(`Retrying chunk ${i + 1}, attempt ${retries + 1}`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          }
        }
      }

      // Create a new zip file containing all chunks
      const zip = new JSZip();

      // Process each blob and add its contents to the zip
      for (let i = 0; i < blobs.length; i++) {
        const chunkBlob = blobs[i];
        const chunkZip = await JSZip.loadAsync(chunkBlob);

        // Add each file from the chunk to the main zip
        for (const [filename, file] of Object.entries(chunkZip.files)) {
          const zipFile = file as JSZipObject;
          if (!zipFile.dir) {
            const content = await zipFile.async("nodebuffer");
            zip.file(filename, content);
          }
        }
      }

      // Generate the final zip file
      const finalZip = await zip.generateAsync({ type: "blob" });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(finalZip);
      const a = document.createElement("a");
      a.href = url;
      a.download = "typo-special-files.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error downloading files:", error);
      setError(error.message || "Failed to download files");
    } finally {
      setIsDownloading(false);
      setProgress(0);
      setCurrentFile(null);
      setCurrentChunk(0);
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
        {isDownloading ? `Downloading... ${progress}%` : "Download all files"}
      </button>
      {isDownloading && currentFile && (
        <p className="text-sm text-gray-600">{currentFile}</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default DownloadAllButton;
