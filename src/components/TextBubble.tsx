import React, { useImperativeHandle, useRef, useEffect, useState } from "react";
import "./TextBubble.css";
import AddFilesButton from "./AddFilesButton";
import brid from "../assets/brid.svg";
import loader from "../assets/loader.svg";
import Image from "next/image";

interface TextBubbleProps {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  handleAddFile: (file: File) => void;
  linkGenerated: boolean;
  setDisabledState: React.Dispatch<React.SetStateAction<boolean>>;
  step: number;
}

const TextBubble = React.forwardRef((props: TextBubbleProps, ref) => {
  const {
    selectedFiles,
    handleAddFile,
    linkGenerated,
    setDisabledState,
    step,
  } = props;

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [ttl, setTtl] = useState<string>("");
  console.log(ttl);

  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, []);

  const insertFileToken = (file: File) => {
    if (contentEditableRef.current) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const fileTokenElement = document.createElement("span");

        // Apply inactive styles initially
        fileTokenElement.className = "file-token inactive-token";
        fileTokenElement.contentEditable = "false"; // Make token non-editable
        fileTokenElement.style.padding = "0 5px";
        fileTokenElement.style.borderRadius = "12px";
        fileTokenElement.style.margin = "0 5px";
        fileTokenElement.style.display = "inline-flex";
        fileTokenElement.style.alignItems = "center";
        fileTokenElement.style.width = "fit-content";
        fileTokenElement.style.userSelect = "none"; // Prevent token from being copied

        // Add an onclick handler to set the active token and deactivate others
        fileTokenElement.onclick = (e) => {
          const tokens =
            contentEditableRef.current?.querySelectorAll(".file-token");
          tokens?.forEach((token) => {
            token.classList.remove("active-token");
            token.classList.add("inactive-token");
          });

          if (e.currentTarget) {
            const token = e.currentTarget as HTMLSpanElement;
            token.classList.add("active-token");
            token.classList.remove("inactive-token");
            setTtl(file.name);
          }
        };

        const thumbnail = document.createElement("img");
        thumbnail.src = URL.createObjectURL(file);
        thumbnail.style.width = "12px";
        thumbnail.style.height = "12px";
        thumbnail.style.marginRight = "5px";
        thumbnail.style.borderRadius = "4px";

        const fileName = document.createElement("span");
        fileName.textContent = file.name;

        fileTokenElement.appendChild(thumbnail);
        fileTokenElement.appendChild(fileName);

        range.insertNode(fileTokenElement);
        range.collapse(false); // Move the cursor after the token
        contentEditableRef.current.focus();
      }
    }
  };

  useImperativeHandle(ref, () => ({
    insertFileToken,
  }));

  return (
    <div
      className={`bg-gradient-to-b from-[#3076FF] to-[#1D49E5] w-full h-full trunc rounded-2xl pb-2 -translate-y-16 relative ${
        step >= 2 && !linkGenerated ? "opacity-70 cursor-none" : ""
      } ${step >= 1 && step !== 4 ? "mb-44" : ""}`}
    >
      <div className="text-bubble w-full">
        <div
          ref={contentEditableRef}
          className="text-input w-full h-full overflow-visible"
          contentEditable={step < 2}
          suppressContentEditableWarning={true}
          onInput={() => {
            if (
              contentEditableRef.current &&
              contentEditableRef.current.textContent?.trim() !== ""
            ) {
              setDisabledState(false);
            } else {
              setDisabledState(true);
            }
          }}
        >
          {/* Inline file tokens and text will appear here */}
          {selectedFiles.map((_, index) => (
            <span key={index}></span>
          ))}
        </div>
      </div>
      <AddFilesButton handleAddFile={handleAddFile} />

      {/* Conditionally render brid and loader images only if there's an actual file */}
      {selectedFiles.length > 0 && step >= 2 && (
        <div className="mt-2 relative translate-y-3">
          <Image
            src={brid}
            alt="Brid"
            className="w-full h-full object-cover rounded-lg"
          />
          <div
            className={`absolute inset-0 bg-black/50 opacity-30 rounded-lg ${
              linkGenerated ? "hidden" : ""
            }`}
          ></div>
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              linkGenerated ? "hidden" : ""
            }`}
          >
            <Image src={loader} alt="Loader" className="w-full" />
          </div>
          <div
            className={`flex w-full justify-center ${
              linkGenerated ? "hidden" : ""
            }`}
          >
            <p className="text-white text-xs absolute bottom-4 text-center w-[150px] bg-[#19191980] py-1 px-2 rounded-full">
              1.9GB/2GB Uploaded
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default TextBubble;
