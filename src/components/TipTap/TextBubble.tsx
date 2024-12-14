import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Paragraph } from "@tiptap/extension-paragraph";
import { FileTokenNode } from "./fileTokenExtenstion";
import "../TextBubble.css";
import doc from "@/assets/doc.svg";
import loader from "@/assets/loader.svg";
import PreviewBox from "./PreviewBox";
import Image from "next/image";

interface FileData {
  file: File;
  placeholderId: string;
}

interface TextBubbleProps {
  selectedFiles: FileData[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  linkGenerated: boolean;
  isGenerating: boolean;
  setDisabledState: React.Dispatch<React.SetStateAction<boolean>>;
  step: number;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatFileSize = (sizeInBytes: number): string => {
  const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
  if (sizeInGB >= 1) {
    return `${sizeInGB.toFixed(2)} GB`;
  } else {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return `${sizeInMB.toFixed(2)} MB`;
  }
};

const calculateCumulativeFileSize = (files: FileData[]): number => {
  return files.reduce(
    (totalSize, fileData) => totalSize + fileData.file.size,
    0
  );
};

const TextBubble = React.forwardRef((props: TextBubbleProps, ref) => {
  const {
    selectedFiles,
    linkGenerated,
    isGenerating,
    setDisabledState,
    step,
    handleFileUpload,
    setSelectedFiles,
  } = props;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      FileTokenNode, // TipTap node extension
      Paragraph.configure({
        HTMLAttributes: {
          class:
            "text-left focus:border-transparent text-white text-left overflow-y-visible focus:outline-none",
        },
      }),
    ],
    content: `
    <p></p>
    `,
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) {
        setDisabledState(true);
      } else {
        setDisabledState(false);
      }
    },
    autofocus: true,
    editable: step >= 1 ? false : true,
    editorProps: {
      attributes: {
        class:
          "w-[290px] text-left min-h-[220px] text-white text-left overflow-visible focus:outline-none",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const currentSelection = editor.state.selection;
      const from = currentSelection.from;
      const to = currentSelection.to;

      let selectedToken: FileData | undefined;

      selectedFiles.forEach((fileData) => {
        const { placeholderId } = fileData;
        editor.view.state.doc.descendants((node, pos) => {
          if (
            node.attrs?.placeholderId === placeholderId &&
            pos >= from &&
            pos <= to
          ) {
            selectedToken = fileData;
            return false;
          }
        });
      });

      if (selectedToken) {
        setSelectedFile(selectedToken.file);
      } else {
        setSelectedFile(null);
      }
    },
  });

  const insertFileTokens = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const placeholderId = `file-token-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        editor?.commands.insertContent({
          type: "fileToken",
          attrs: {
            fileName: file.name,
            placeholderId,
          },
        });

        editor?.commands.insertContent({
          type: "text",
          text: " ", // Adds a space after each token
        });

        setSelectedFiles((prev: FileData[]) => [
          ...prev,
          { file, placeholderId },
        ]);
      });
    },
    [editor, setSelectedFiles]
  );

  useImperativeHandle(ref, () => ({
    insertFileTokens,
    getEditorContent: () => editor?.getHTML(),
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const files = Array.from(event.dataTransfer.files);
      if (files.length) {
        insertFileTokens(files);
      }
    },
    [insertFileTokens]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Calculate the total file size of all selected files
  const totalFileSize = calculateCumulativeFileSize(selectedFiles);
  const formattedFileSize = formatFileSize(totalFileSize);

  return (
    <div
      className={`w-full h-full trunc rounded-2xl pb-2 -translate-y-16 relative ${
        step >= 2 && !linkGenerated
          ? "bg-[#97b8fd] cursor-none"
          : "bg-gradient-to-b from-[#3076FF] to-[#1D49E5] "
      } ${step >= 1 && step !== 4 ? "mb-44" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="text-bubble w-full h-full text-white">
        <EditorContent editor={editor} />
      </div>
      <>
        <button
          disabled={step >= 1}
          contentEditable={false}
          className={`flex items-center gap-2 bg-[#FFFFFF33] text-white text-xs py-1 px-2 rounded-3xl mx-auto ${
            step >= 1 ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={handleButtonClick}
        >
          Add files
          <Image src={doc} alt="Document Icon" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          multiple
        />
      </>
      {/* Conditionally render PreviewBox when a file token is selected */}
      {selectedFile && (
        <div className="mt-2 relative translate-y-3">
          <div className="flex flex-col items-center w-full max-w-xs">
            <PreviewBox file={selectedFile} />
          </div>
          {/* Conditionally display loader and overlay if step >= 2 */}
          {step >= 2 && !linkGenerated && (
            <>
              <div className="absolute inset-0 bg-black/50 opacity-30 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={loader}
                  width={50}
                  height={50}
                  alt="Loader"
                  className={`w-full ${isGenerating ? "block" : "hidden"}`}
                />
              </div>
              <div className="flex w-full justify-center">
                <p className="text-white text-xs absolute bottom-4 text-center w-[150px] bg-[#19191980] py-1 px-2 rounded-full">
                  {formattedFileSize} {isGenerating ? "Uploading" : "Selected"}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default TextBubble;
