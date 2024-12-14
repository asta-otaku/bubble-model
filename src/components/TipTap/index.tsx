import React, { useState, useRef, useEffect } from "react";
import TextBubble from "./TextBubble";
import StepOneBottom from "@/components/StepOneBottom";
import { uploadFiles, createBubble } from "@/services/apiService";

interface FileData {
  file: File;
  placeholderId: string;
}

const App = () => {
  const [createdTokens, setCreatedTokens] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [userPhone, setUserPhone] = useState<string>("");
  const textBubbleRef = useRef<{
    insertFileTokens: (files: File[]) => void;
    getEditorContent: () => string | undefined;
  }>(null);
  const [disabledState, setDisabledState] = useState(true);

  // Log every step to debug the duplication issue
  console.log("Current selected files:", selectedFiles);
  console.log("Current created tokens:", createdTokens);

  // Handle file drop
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach((file) =>
        setSelectedFiles((prevFiles) => [
          ...prevFiles,
          {
            file,
            placeholderId: `file-token-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          },
        ])
      );
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  useEffect(() => {
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  const [step, setStep] = useState(0);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (textBubbleRef.current) {
      // Filter out duplicate files based on file name
      const newFiles = files.filter(
        (file) => !selectedFiles.some((f) => f.file.name === file.name)
      );

      console.log("New files after filtering duplicates:", newFiles);

      // Insert new tokens into the editor if there are any new files
      if (newFiles.length > 0) {
        textBubbleRef.current.insertFileTokens(newFiles); // Insert tokens into the editor

        // Update the selected files state using a function to prevent state mutation issues
        setSelectedFiles((prevFiles) => {
          const updatedFiles = [
            ...prevFiles,
            ...newFiles.map((file) => ({
              file,
              placeholderId: `file-token-${Math.random()
                .toString(36)
                .substring(2, 9)}`, // Assign unique placeholderId
            })),
          ];

          // Remove duplicates (if any)
          const uniqueUpdatedFiles = updatedFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f.file.name === file.file.name)
          );

          console.log("Unique updated files:", uniqueUpdatedFiles);
          return uniqueUpdatedFiles;
        });
      } else {
        console.log("No new files to add.");
      }
    }
  };
  const cleanHTMLContent = (htmlContent: string): string => {
    // First, remove unnecessary attributes from all tags except `<file-token>`
    const cleanedContent = htmlContent.replace(
      /(<(?!file-token)[^>\s]+)([^>]*)/g,
      "$1"
    );

    // Ensure that `file-token` keeps only its `id` attribute (if present) and removes other attributes
    const preserveFileTokenId = cleanedContent.replace(
      /<file-token([^>]*?)>/g,
      (_, attributes) => {
        const idMatch = attributes.match(/id="[^"]+"/); // Extract the `id` attribute if it exists
        return idMatch ? `<file-token ${idMatch[0]}>` : `<file-token>`;
      }
    );

    return preserveFileTokenId;
  };

  // Handle bubble creation (upload files, replace placeholders with actual tokens)
  const handleCreateBubble = async (): Promise<{ bubbleId: string | null }> => {
    if (!textBubbleRef.current) {
      console.error("Editor reference not found.");
      return { bubbleId: null };
    }

    // Get editor content
    let bubbleContent = textBubbleRef.current.getEditorContent();
    console.log("Editor content before token replacement:", bubbleContent);

    if (!bubbleContent) {
      console.error("No content found in the editor.");
      return { bubbleId: null };
    }

    // Clean the HTML content to remove unnecessary styling and attributes
    bubbleContent = cleanHTMLContent(bubbleContent);
    console.log("Cleaned bubble content:", bubbleContent);

    try {
      // Ensure files are only uploaded once
      if (selectedFiles.length === 0) {
        console.error("No files selected for upload.");
        return { bubbleId: null };
      }

      // Upload the selected files and get the created tokens
      console.log("Starting to upload files:", selectedFiles);
      const data = await uploadFiles(
        selectedFiles.map((fileData) => fileData.file)
      );
      console.log("Uploaded files and received tokens:", data);

      // Filter out duplicate tokens
      const uniqueTokens = data.filter(
        (token: any, index: number, self: any[]) =>
          index === self.findIndex((t) => t._id === token._id)
      );
      setCreatedTokens(uniqueTokens); // Update state with unique tokens

      console.log("Unique tokens after filtering:", uniqueTokens);

      // Replace placeholders with actual token IDs in the bubble content
      selectedFiles.forEach((fileData, index) => {
        const placeholderId = fileData.placeholderId; // Get the correct placeholder ID
        const token = uniqueTokens[index]; // Get the corresponding token from the uniqueTokens array

        const placeholderRegex = new RegExp(
          `<file-token[^>]*id="${placeholderId}"></file-token>`,
          "g"
        );
        bubbleContent = bubbleContent?.replace(
          placeholderRegex,
          `<file-token id="${token._id}"></file-token>` // Replace placeholder with token ID
        );
      });

      console.log("Final bubble content to send:", bubbleContent);

      // Create the bubble with the processed content and unique token IDs
      const createdBubble = await createBubble(
        bubbleContent,
        uniqueTokens.map((token: any) => token._id),
        userPhone
      );
      console.log("Bubble created successfully:", createdBubble);

      // Return the bubbleId from the created bubble response
      return { bubbleId: createdBubble._id };
    } catch (error) {
      console.error("Error creating bubble:", error);
      return { bubbleId: null };
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center flex-col py-16 relative p-4">
      <div className="flex flex-col gap-6 w-[360px] items-end mx-auto p-6">
        <TextBubble
          ref={textBubbleRef}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          setDisabledState={setDisabledState}
          linkGenerated={linkGenerated}
          handleFileUpload={handleFileUpload}
          isGenerating={isGenerating}
          step={step}
        />
      </div>
      <StepOneBottom
        disabledState={disabledState}
        setStep={setStep}
        step={step}
        linkGenerated={linkGenerated}
        setLinkGenerated={setLinkGenerated}
        handleCreateBubble={handleCreateBubble}
        setUserPhone={setUserPhone}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
      />
    </div>
  );
};

export default App;
