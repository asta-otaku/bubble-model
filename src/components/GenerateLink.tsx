import { useState } from "react";
import copyIcon from "../assets/copy.svg";
import Image from "next/image";

const GenerateLinkButton = ({
  linkGenerated,
  isGenerating,
  handleCreateBubble,
  setLinkGenerated,
  setIsGenerating,
}: {
  linkGenerated: boolean;
  isGenerating: boolean;
  handleCreateBubble: () => Promise<{ bubbleId: string | null }>;
  setLinkGenerated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [disabledState, setDisabledState] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const handleButtonClick = async () => {
    setIsGenerating(true);
    setDisabledState(true);
    try {
      // Call handleCreateBubble and get the bubbleId
      const { bubbleId } = await handleCreateBubble();
      if (bubbleId) {
        const frontendBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
        const newLink = `${frontendBaseUrl}/bubble/${bubbleId}`;
        setGeneratedLink(newLink); // Set the generated link with bubbleId
        setLinkGenerated(true); // Ensure this is updated after the bubble is created
      } else {
        console.error("Bubble ID not available");
      }
    } catch (error) {
      console.error("Error creating bubble:", error);
    } finally {
      setIsGenerating(false);
      setDisabledState(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link copied to clipboard!");
  };

  return (
    <button
      onClick={handleButtonClick}
      disabled={disabledState || generatedLink !== ""}
      className={`bg-[#F3F3F3BF] text-secondary px-4 py-2.5 rounded-full w-[260px] flex items-center gap-2 font-semibold ${
        disabledState ? "opacity-40 cursor-not-allowed" : ""
      } shadow-sm shadow-secondary`}
    >
      {linkGenerated ? (
        <div className="flex items-center gap-2 max-w-[250px] w-full truncate">
          <Image
            src={copyIcon}
            alt="Copy icon"
            className="w-4 h-4 cursor-pointer"
            onClick={handleCopyLink}
          />
          <a href={generatedLink} target="_blank" rel="noopener noreferrer">
            {generatedLink}
          </a>
        </div>
      ) : isGenerating ? (
        <span className="w-full text-center">Generating link...</span>
      ) : (
        <span className="w-full text-center">Generate link</span>
      )}
    </button>
  );
};

export default GenerateLinkButton;
