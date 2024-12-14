// import { useRef, useState, useEffect } from "react";
// import TextBubble from "./TextBubble";
// import StepOneBottom from "./StepOneBottom";

// function StepOne() {
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [disabledState, setDisabledState] = useState(true);
//   const textBubbleRef = useRef<{
//     insertFileToken: (file: File) => void;
//   } | null>(null);

//   const handleAddFile = (file: File) => {
//     // Check if file already exists in the selectedFiles array
//     if (
//       !selectedFiles.some((existingFile) => existingFile.name === file.name)
//     ) {
//       setSelectedFiles((prevFiles) => [...prevFiles, file]);

//       // Insert the file token into the contenteditable div
//       if (textBubbleRef.current) {
//         textBubbleRef.current.insertFileToken(file);
//       }
//     }
//   };

//   const handleDrop = (event: DragEvent) => {
//     event.preventDefault();
//     event.stopPropagation();
//     if (event.dataTransfer?.files) {
//       Array.from(event.dataTransfer.files).forEach((file) =>
//         handleAddFile(file)
//       );
//     }
//   };

//   const handleDragOver = (event: DragEvent) => {
//     event.preventDefault();
//   };

//   useEffect(() => {
//     window.addEventListener("dragover", handleDragOver);
//     window.addEventListener("drop", handleDrop);

//     return () => {
//       window.removeEventListener("dragover", handleDragOver);
//       window.removeEventListener("drop", handleDrop);
//     };
//   }, []);

//   const [step, setStep] = useState(0);
//   const [linkGenerated, setLinkGenerated] = useState(false);

//   return (
//     <div className="w-full min-h-screen flex justify-center items-center flex-col py-16 relative p-4">
//       <div className="flex flex-col gap-6 self-stretch md:self-auto w-[360px] items-start mx-auto p-6 mt-6">
//         <TextBubble
//           ref={textBubbleRef}
//           selectedFiles={selectedFiles}
//           setSelectedFiles={setSelectedFiles}
//           handleAddFile={handleAddFile}
//           setDisabledState={setDisabledState}
//           linkGenerated={linkGenerated}
//           step={step}
//         />
//       </div>
//       <StepOneBottom
//         disabledState={disabledState}
//         setStep={setStep}
//         step={step}
//         linkGenerated={linkGenerated}
//         setLinkGenerated={setLinkGenerated}
//         />
//     </div>
//   );
// }

// export default StepOne;
