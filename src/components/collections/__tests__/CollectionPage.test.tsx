import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams } from "next/navigation";
import CollectionPage from "../CollectionPage";
import { useCollectionData } from "../useCollectionData";
import { useNavigationState } from "../useNavigationState";
import { useModalState } from "../useModalState";

// Mock the hooks
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("../useCollectionData");
jest.mock("../useNavigationState");
jest.mock("../useModalState");

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_COLLECTION_URL: "https://test-collection.com",
  NEXT_PUBLIC_USER_ID: "test-user-id",
  NEXT_PUBLIC_VIDEO_PLAYER_MODE: "native",
};

Object.defineProperty(process.env, "NEXT_PUBLIC_COLLECTION_URL", {
  value: mockEnv.NEXT_PUBLIC_COLLECTION_URL,
  writable: true,
});

Object.defineProperty(process.env, "NEXT_PUBLIC_USER_ID", {
  value: mockEnv.NEXT_PUBLIC_USER_ID,
  writable: true,
});

Object.defineProperty(process.env, "NEXT_PUBLIC_VIDEO_PLAYER_MODE", {
  value: mockEnv.NEXT_PUBLIC_VIDEO_PLAYER_MODE,
  writable: true,
});

describe("CollectionPage", () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseCollectionData = useCollectionData as jest.MockedFunction<
    typeof useCollectionData
  >;
  const mockUseNavigationState = useNavigationState as jest.MockedFunction<
    typeof useNavigationState
  >;
  const mockUseModalState = useModalState as jest.MockedFunction<
    typeof useModalState
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseParams.mockReturnValue({ slug: "test-collection" });

    mockUseCollectionData.mockReturnValue({
      files: [],
      subCollections: [],
      collectionTitle: "Test Collection",
      collectionOwner: "Test Owner",
      collectionDate: "2024-01-01",
      isLoading: false,
      isInitialized: true,
    });

    mockUseNavigationState.mockReturnValue({
      activeSubCollection: null,
      parentLevel: null,
      handleSubCollectionClick: jest.fn(),
      handleBackToParent: jest.fn(),
    });

    mockUseModalState.mockReturnValue({
      currentIndex: 0,
      setCurrentIndex: jest.fn(),
      isModalOpen: false,
      modalFiles: [],
      handleFileClick: jest.fn(),
      closeModal: jest.fn(),
    });
  });

  it("renders loading state when data is loading", () => {
    mockUseCollectionData.mockReturnValue({
      files: [],
      subCollections: [],
      collectionTitle: "",
      collectionOwner: "",
      collectionDate: "",
      isLoading: true,
      isInitialized: false,
    });

    render(<CollectionPage />);

    expect(screen.getByTestId("collection-loading")).toBeInTheDocument();
  });

  it("renders empty state when no files or subcollections", () => {
    render(<CollectionPage />);

    expect(
      screen.getByText("No files found in this collection")
    ).toBeInTheDocument();
  });

  it("renders collection with files and subcollections", () => {
    const mockFiles = [
      {
        index: 0,
        type: "FILE" as const,
        cloudFrontDownloadLink: "https://example.com/test.jpg",
        optimisedImageUrl: "https://example.com/test.jpg",
        metaData: {},
        content: {
          name: "test-file.jpg",
          url: "https://example.com/test.jpg",
        },
      },
    ];

    const mockSubCollections = [
      {
        rootCollection: {
          id: "sub-1",
          name: "Test Subcollection",
        },
        attachmentDtos: [],
        subCollections: [],
      },
    ];

    mockUseCollectionData.mockReturnValue({
      files: mockFiles as any,
      subCollections: mockSubCollections,
      collectionTitle: "Test Collection",
      collectionOwner: "Test Owner",
      collectionDate: "2024-01-01",
      isLoading: false,
      isInitialized: true,
    });

    render(<CollectionPage />);

    expect(screen.getByText("Test Collection")).toBeInTheDocument();
    expect(screen.getByText("Test Owner")).toBeInTheDocument();
  });

  it("handles file click correctly", async () => {
    const mockHandleFileClick = jest.fn();
    mockUseModalState.mockReturnValue({
      currentIndex: 0,
      setCurrentIndex: jest.fn(),
      isModalOpen: false,
      modalFiles: [],
      handleFileClick: mockHandleFileClick,
      closeModal: jest.fn(),
    });

    const mockFiles = [
      {
        index: 0,
        type: "FILE" as const,
        cloudFrontDownloadLink: "https://example.com/test.jpg",
        optimisedImageUrl: "https://example.com/test.jpg",
        metaData: {
          username: "test",
          avatarUrl: "https://example.com/avatar.jpg",
          mediaUrl: "https://example.com/media.jpg",
          faviconUrl: "https://example.com/favicon.ico",
          title: "Test",
          description: "Test description",
          siteName: "Test Site",
          imageUrl: "https://example.com/image.jpg",
          videoUrl: "https://example.com/video.mp4",
        },
        content: {
          name: "test-file.jpg",
          url: "https://example.com/test.jpg",
        },
      },
    ];

    mockUseCollectionData.mockReturnValue({
      files: mockFiles as any,
      subCollections: [],
      collectionTitle: "Test Collection",
      collectionOwner: "Test Owner",
      collectionDate: "2024-01-01",
      isLoading: false,
      isInitialized: true,
    });

    render(<CollectionPage />);

    const fileElement = screen.getByText("test-file.jpg");
    fireEvent.click(fileElement);

    await waitFor(() => {
      expect(mockHandleFileClick).toHaveBeenCalledWith(0, mockFiles);
    });
  });

  it("handles subcollection click correctly", async () => {
    const mockHandleSubCollectionClick = jest.fn();
    mockUseNavigationState.mockReturnValue({
      activeSubCollection: null,
      parentLevel: null,
      handleSubCollectionClick: mockHandleSubCollectionClick,
      handleBackToParent: jest.fn(),
    });

    const mockSubCollections = [
      {
        rootCollection: {
          id: "sub-1",
          name: "Test Subcollection",
        },
        attachmentDtos: [],
        subCollections: [],
      },
    ];

    mockUseCollectionData.mockReturnValue({
      files: [],
      subCollections: mockSubCollections,
      collectionTitle: "Test Collection",
      collectionOwner: "Test Owner",
      collectionDate: "2024-01-01",
      isLoading: false,
      isInitialized: true,
    });

    render(<CollectionPage />);

    const subcollectionElement = screen.getByText("Test Subcollection");
    fireEvent.click(subcollectionElement);

    await waitFor(() => {
      expect(mockHandleSubCollectionClick).toHaveBeenCalledWith(
        mockSubCollections[0]
      );
    });
  });

  it("handles navigation state changes correctly", () => {
    const mockActiveSubCollection = {
      rootCollection: {
        id: "sub-1",
        name: "Active Subcollection",
      },
      attachmentDtos: [],
      subCollections: [],
    };

    mockUseNavigationState.mockReturnValue({
      activeSubCollection: mockActiveSubCollection,
      parentLevel: {
        id: "root",
        name: "Test Collection",
        type: "collection",
      },
      handleSubCollectionClick: jest.fn(),
      handleBackToParent: jest.fn(),
    });

    render(<CollectionPage />);

    expect(screen.getByText("Active Subcollection")).toBeInTheDocument();
  });

  it("handles modal state correctly", () => {
    const mockModalFiles = [
      {
        index: 0,
        type: "FILE" as const,
        content: {
          name: "modal-file.jpg",
          url: "https://example.com/modal.jpg",
        },
      },
    ];

    mockUseModalState.mockReturnValue({
      currentIndex: 0,
      setCurrentIndex: jest.fn(),
      isModalOpen: true,
      modalFiles: mockModalFiles as any,
      handleFileClick: jest.fn(),
      closeModal: jest.fn(),
    });

    render(<CollectionPage />);

    // Modal should be rendered when open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("handles error states gracefully", () => {
    // Mock console.error to prevent test output noise
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockUseCollectionData.mockImplementation(() => {
      throw new Error("Test error");
    });

    expect(() => {
      render(<CollectionPage />);
    }).not.toThrow();

    consoleSpy.mockRestore();
  });
});
