import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import doc from "../assets/doc.svg";
import Image from "next/image";

const AddFilesButton = ({
  onFileSelected,
  selectedFiles,
}: {
  onFileSelected: (files: File[]) => void;
  selectedFiles: File[];
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: any) => {
    if (event.target.files?.length > 0) {
      const newFiles = Array.from(event.target.files).filter(
        (file: any) => !selectedFiles.some((f: File) => f.name === file.name)
      );
      if (newFiles.length > 0) onFileSelected(newFiles as File[]);
    }
  };

  return (
    <div>
      <button
        contentEditable={false}
        className="flex items-center gap-2 bg-[#FFFFFF33] text-white text-xs py-1 px-2 rounded-3xl mx-auto"
        onClick={handleButtonClick}
      >
        Add files
        <Image src={doc} alt="Document Icon" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple
      />
    </div>
  );
};

const FileComponent = ({
  node,
  activeFile,
}: {
  node: any;
  activeFile: string;
}) => {
  let isActive = activeFile === node.attrs.name;

  console.log(activeFile, node.attrs.name, isActive);

  const handleClick = () => {
    activeFile = node.attrs.name;
    console.log(activeFile, node.attrs.name, isActive);
  };

  return (
    <NodeViewWrapper className="file-token">
      <button
        onClick={handleClick}
        className={`file-token-content cursor-pointer flex items-center gap-2 px-2 py-1 rounded ${
          isActive ? "bg-white text-secondary" : "bg-[#ffffff33] text-black"
        }`}
      >
        <Image
          src={node.attrs.src}
          alt={node.attrs.name}
          className="file-thumbnail"
          style={{ width: "12px", height: "12px", marginRight: "5px" }}
        />
        {node.attrs.name}
      </button>
    </NodeViewWrapper>
  );
};

const FileNode = Node.create({
  name: "fileNode",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: { default: null },
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "file-token" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["file-token", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return (props) => {
      let activeFile = "";
      return ReactNodeViewRenderer((nodeProps) => (
        <FileComponent {...nodeProps} activeFile={activeFile} />
      ))(props);
    };
  },
});

function FileEditor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const editor = useEditor({
    extensions: [StarterKit, FileNode],
    content: `<p>Click below to add files and render them inline.</p>`,
  });

  const handleAddFile = (files: File[]) => {
    setSelectedFiles([...selectedFiles, ...files]);
    files.forEach((file: File) =>
      editor
        ?.chain()
        .focus()
        .insertContent({
          type: "fileNode",
          attrs: { name: file.name, src: URL.createObjectURL(file) },
        })
        .run()
    );
  };

  return (
    <div className="editor-container">
      <AddFilesButton
        onFileSelected={handleAddFile}
        selectedFiles={selectedFiles}
      />
      <EditorContent editor={editor} className="prose" />
    </div>
  );
}

export default FileEditor;
