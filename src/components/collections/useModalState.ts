import { useState, useEffect } from "react";
import { Message } from "@/utils/BubbleSpecialInterfaces";

export const useModalState = (activeSubCollection: any | null) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFiles, setModalFiles] = useState<Message[]>([]);

  // When a file is clicked, open modal with the current context's files
  const handleFileClick = (index: number, displayFiles: Message[]) => {
    setModalFiles(displayFiles);
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  // Close modal if context changes (e.g., navigating between main and subcollection)
  useEffect(() => {
    setIsModalOpen(false);
    setModalFiles([]);
    setCurrentIndex(0);
  }, [activeSubCollection]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    currentIndex,
    setCurrentIndex,
    isModalOpen,
    modalFiles,
    handleFileClick,
    closeModal,
  };
}; 