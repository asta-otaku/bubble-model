import React, { useState, useEffect, useRef } from "react";
import { AttachmentDto } from "@/utils/BubbleSpecialInterfaces";
import { useCollectionData } from "./useCollectionData";
import { useNavigationState } from "./useNavigationState";
import { useModalState } from "./useModalState";
import { useDisplayData } from "./useDisplayData";
import CollectionNavbar from "./CollectionNavbar";
import CollectionLoadingState from "./CollectionLoadingState";
import CollectionHeader from "./CollectionHeader";
import CollectionGrid from "./CollectionGrid";
import CollectionFileModal from "./CollectionFileModal";

const CollectionPage: React.FC = () => {
  // Data fetching and state management
  const {
    files,
    subCollections,
    collectionTitle,
    collectionOwner,
    collectionDate,
    isLoading,
  } = useCollectionData();

  // Navigation state management
  const {
    activeSubCollection,
    parentLevel,
    handleSubCollectionClick,
    handleBackToParent,
  } = useNavigationState(subCollections, collectionTitle);

  // Scroll state management - force it to work with polling + event listeners
  const [showTopGradient, setShowTopGradient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame: number;

    const checkScroll = () => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop;
        const shouldShow = scrollTop > 20;

        if (shouldShow !== showTopGradient) {
          setShowTopGradient(shouldShow);
        }
      }

      // Keep checking
      animationFrame = requestAnimationFrame(checkScroll);
    };

    // Start checking immediately
    animationFrame = requestAnimationFrame(checkScroll);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [showTopGradient]);

  // Modal state management
  const {
    currentIndex,
    setCurrentIndex,
    isModalOpen,
    modalFiles,
    handleFileClick,
    closeModal,
  } = useModalState(activeSubCollection);

  // Helper function to convert AttachmentDto to Message format
  const convertAttachmentToMessage = (attachment: AttachmentDto) => {
    const textAttachment = attachment.textAttachment;
    const attachedContent = textAttachment.attachedContent;

    // Determine if it's a link
    const isLink = textAttachment.type === 0;

    return {
      index: textAttachment.index,
      type: isLink ? ("LINK" as const) : ("FILE" as const),
      cloudFrontDownloadLink: textAttachment.cloudFrontDownloadLink,
      optimisedImageUrl: textAttachment.optimisedImageUrl,
      metaData: textAttachment.metaData,
      muxDetailsForWebclient:
        textAttachment.muxDetailsForWebclient || undefined,
      content: {
        contentId: attachedContent.id,
        startTime: 0,
        referencedAttachment: {
          thumbnailImage: attachedContent.thumbnailImage,
          name: attachedContent.name,
          size: attachedContent.size,
          width: attachedContent.width,
          height: attachedContent.height,
          muxPlaybackId: attachedContent.muxPlaybackId || "",
          muxDetailsForWebclient:
            textAttachment.muxDetailsForWebclient || undefined,
          id: attachedContent.id,
          url: isLink
            ? attachedContent.url
            : textAttachment.cloudFrontDownloadLink,
          optimisedImageUrl: textAttachment.optimisedImageUrl,
        },
        thumbnailImage: attachedContent.thumbnailImage,
        name: attachedContent.name,
        size: attachedContent.size,
        width: attachedContent.width,
        height: attachedContent.height,
        muxPlaybackId: attachedContent.muxPlaybackId || "",
        muxDetailsForWebclient:
          textAttachment.muxDetailsForWebclient || undefined,
        id: attachedContent.id,
        url: isLink
          ? attachedContent.url
          : textAttachment.cloudFrontDownloadLink,
        userId: "",
        optimisedImageUrl: textAttachment.optimisedImageUrl,
      },
    };
  };

  // Calculate display data
  const {
    displayFiles,
    displaySubCollections,
    displayTitle,
    displayOwner,
    displayDate,
  } = useDisplayData(
    files,
    subCollections,
    collectionTitle,
    collectionOwner,
    collectionDate,
    activeSubCollection,
    convertAttachmentToMessage
  );

  // Loading state
  if (isLoading) {
    return <CollectionLoadingState />;
  }

  // Empty state
  if (displayFiles.length === 0 && displaySubCollections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white relative">
        <CollectionNavbar
          showTopGradient={showTopGradient}
          breadcrumbProps={{
            activeSubCollection,
            parentLevel,
            displayTitle,
            onBackToParent: handleBackToParent,
          }}
        />
        <div className="flex-1 relative">
          <div
            className="p-6 pt-32 h-screen overflow-auto hide-scrollbar relative"
            ref={contentRef}
          >
            <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg">
                  No files found in this collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Fixed navbar at top */}
      <CollectionNavbar
        showTopGradient={showTopGradient}
        breadcrumbProps={{
          activeSubCollection,
          parentLevel,
          displayTitle,
          onBackToParent: handleBackToParent,
        }}
      />

      {/* Content area with gradient overlays */}
      <div className="flex-1 relative">
        {/* Scrollable content - takes full height with top padding for navbar */}
        <div
          className="p-6 pt-32 h-screen overflow-auto hide-scrollbar relative"
          ref={contentRef}
        >
          <div className="max-w-screen-2xl mx-auto w-full">
            {/* Collection header */}
            <CollectionHeader
              displayFiles={displayFiles}
              displaySubCollections={displaySubCollections}
              displayTitle={displayTitle}
              displayOwner={displayOwner}
              displayDate={displayDate}
              activeSubCollection={activeSubCollection}
            />

            {/* Files and subcollections grid */}
            <CollectionGrid
              displayFiles={displayFiles}
              displaySubCollections={displaySubCollections}
              onSubCollectionClick={handleSubCollectionClick}
              onFileClick={(index) => handleFileClick(index, displayFiles)}
              convertAttachmentToMessage={convertAttachmentToMessage}
            />
          </div>
        </div>
      </div>
      {/* Modal for files or subcollection files */}
      <CollectionFileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        files={modalFiles}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
};

export default CollectionPage;
