"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TokenPreview from "@/components/TokenPreview";
import { truncateFilename } from "@/components/TruncateText";
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface Token {
  _id: string;
  type: string;
  fileName: string;
  url: string;
  size: string;
  createdAt: string;
}

interface BubbleData {
  _id: string;
  content: string;
  tokens: Token[];
  createdByPhone: string;
  createdAt: string;
  updatedAt: string;
}

function Page() {
  const router = useParams();
  const { slug } = router;
  const [bubbleData, setBubbleData] = useState<BubbleData | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBubbleData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/bubbles/${slug}`);
        if (response.status === 200) {
          const data: BubbleData = response.data;
          setBubbleData(data);

          if (data.tokens.length > 0) {
            setSelectedToken(data.tokens[0]);
          }
        } else {
          setError("Bubble not found");
        }
      } catch (error) {
        console.error("Error fetching bubble data", error);
        setError("Error fetching bubble data");
      }
    };

    fetchBubbleData();
  }, [slug]);

  const renderContent = (content: string, tokens: Token[]) => {
    const elements: JSX.Element[] = [];
    let currentText = "";

    const addText = (text: string, index: number) => {
      if (text) {
        elements.push(
          <span
            key={`text-${index}`}
            className="text-white inline"
            dangerouslySetInnerHTML={{ __html: text.replace(/\s+/g, " ") }}
          />
        );
      }
    };

    const getFileIcon = (fileName: string) => {
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      switch (fileExtension) {
        case "zip":
        case "rar":
          return "📦";
        case "mp3":
        case "wav":
        case "ogg":
          return "🎵";
        case "mp4":
        case "avi":
        case "mkv":
          return "🎥";
        case "pdf":
        case "doc":
        case "docx":
          return "📄";
        case "xls":
        case "xlsx":
          return "📊";
        case "csv":
          return "📑";
        default:
          return "📄";
      }
    };

    const addToken = (tokenId: string, index: number) => {
      const token = tokens.find((t) => t._id === tokenId);
      if (!token) return;

      elements.push(
        <button
          key={`token-${token._id}-${index}`}
          onClick={() => setSelectedToken(token)}
          className={`inline-flex items-center gap-0.5 text-xs py-1 px-2 mx-0.5 rounded-3xl w-fit cursor-pointer ${
            selectedToken?._id === token._id
              ? "bg-white text-secondary"
              : "bg-[#FFFFFF33] text-white"
          }`}
        >
          <span>{getFileIcon(token.fileName)}</span>
          <span className="text-inherit max-w-20 w-full truncate">
            {truncateFilename(token.fileName)}
          </span>
        </button>
      );
    };

    const processContent = () => {
      // Remove <p> tags
      content = content.replace(/<\/?p>/g, "");

      let i = 0;
      while (i < content.length) {
        if (content.slice(i).startsWith("<file-token")) {
          // Add accumulated text before the token
          addText(currentText, i);
          currentText = "";

          // Find the end of the token tag
          const closeIndex = content.indexOf(">", i);
          if (closeIndex !== -1) {
            // Extract the token ID
            const idMatch = content.slice(i, closeIndex).match(/id="([^"]+)"/);
            if (idMatch) {
              addToken(idMatch[1], elements.length);
            }
            // Move past the closing tag
            const tokenEndIndex = content.indexOf("</file-token>", closeIndex);
            i = tokenEndIndex + "</file-token>".length;
          } else {
            currentText += content[i];
            i++;
          }
        } else {
          currentText += content[i];
          i++;
        }
      }

      // Add any remaining text
      if (currentText) {
        addText(currentText, elements.length);
      }
    };

    processContent();
    return elements;
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!bubbleData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center flex-col py-16 relative p-4">
      <div className="flex flex-col gap-6 w-[360px] items-end mx-auto p-6">
        <article className="bg-gradient-to-b from-[#3076FF] overflow-hidden to-[#1D49E5] w-full text-[17px] pt-3 rounded-2xl">
          <div className="px-3 font-light text-white whitespace-pre-wrap break-words">
            {renderContent(bubbleData.content, bubbleData.tokens)}
          </div>

          <div className="bubble-bottom mt-2 w-full">
            {selectedToken && <TokenPreview token={selectedToken} />}
          </div>
        </article>
      </div>
    </div>
  );
}

export default Page;
