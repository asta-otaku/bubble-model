import { renderHook, act } from "@testing-library/react";
import { useNavigationState } from "../useNavigationState";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/test-path"),
}));

// Mock window.history
const mockHistory = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  state: null,
};

Object.defineProperty(window, "history", {
  value: mockHistory,
  writable: true,
});

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
  writable: true,
});

describe("useNavigationState", () => {
  const mockSubCollections = [
    {
      rootCollection: {
        id: "sub-1",
        name: "Test Subcollection 1",
      },
      attachmentDtos: [],
      subCollections: [
        {
          rootCollection: {
            id: "sub-1-1",
            name: "Nested Subcollection",
          },
          attachmentDtos: [],
          subCollections: [],
        },
      ],
    },
    {
      rootCollection: {
        id: "sub-2",
        name: "Test Subcollection 2",
      },
      attachmentDtos: [],
      subCollections: [],
    },
  ];

  const mockCollectionTitle = "Test Collection";

  beforeEach(() => {
    jest.clearAllMocks();
    mockHistory.state = null;
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    expect(result.current.activeSubCollection).toBeNull();
    expect(result.current.parentLevel).toBeNull();
    expect(typeof result.current.handleSubCollectionClick).toBe("function");
    expect(typeof result.current.handleBackToParent).toBe("function");
  });

  it("handles subcollection click correctly", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    act(() => {
      result.current.handleSubCollectionClick(mockSubCollections[0]);
    });

    expect(result.current.activeSubCollection).toBe(mockSubCollections[0]);
    expect(result.current.parentLevel).toEqual({
      id: "root",
      name: mockCollectionTitle,
      type: "collection",
    });
    expect(mockHistory.pushState).toHaveBeenCalled();
  });

  it("handles nested subcollection navigation", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    // Navigate to first subcollection
    act(() => {
      result.current.handleSubCollectionClick(mockSubCollections[0]);
    });

    // Navigate to nested subcollection
    act(() => {
      result.current.handleSubCollectionClick(
        mockSubCollections[0].subCollections[0]
      );
    });

    expect(result.current.activeSubCollection).toBe(
      mockSubCollections[0].subCollections[0]
    );
    expect(result.current.parentLevel).toEqual({
      id: "sub-1",
      name: "Test Subcollection 1",
      type: "subcollection",
    });
  });

  it("handles back navigation correctly", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    // Navigate to subcollection
    act(() => {
      result.current.handleSubCollectionClick(mockSubCollections[0]);
    });

    // Go back to parent
    act(() => {
      result.current.handleBackToParent();
    });

    expect(result.current.activeSubCollection).toBeNull();
    expect(result.current.parentLevel).toBeNull();
  });

  it("handles nested back navigation correctly", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    // Navigate to first subcollection
    act(() => {
      result.current.handleSubCollectionClick(mockSubCollections[0]);
    });

    // Navigate to nested subcollection
    act(() => {
      result.current.handleSubCollectionClick(
        mockSubCollections[0].subCollections[0]
      );
    });

    // Go back to parent subcollection
    act(() => {
      result.current.handleBackToParent();
    });

    expect(result.current.activeSubCollection).toBe(mockSubCollections[0]);
    expect(result.current.parentLevel).toEqual({
      id: "root",
      name: mockCollectionTitle,
      type: "collection",
    });
  });

  it("handles browser back/forward navigation", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    // Simulate browser back navigation
    const mockPopStateEvent = new PopStateEvent("popstate", {
      state: {
        activeSubCollectionId: "sub-1",
        activeSubCollection: mockSubCollections[0],
        parentLevel: {
          id: "root",
          name: mockCollectionTitle,
          type: "collection",
        },
      },
    });

    act(() => {
      window.dispatchEvent(mockPopStateEvent);
    });

    expect(result.current.activeSubCollection).toBe(mockSubCollections[0]);
    expect(result.current.parentLevel).toEqual({
      id: "root",
      name: mockCollectionTitle,
      type: "collection",
    });
  });

  it("handles fallback when subcollection not found", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    // Simulate browser navigation to non-existent subcollection
    const mockPopStateEvent = new PopStateEvent("popstate", {
      state: {
        activeSubCollectionId: "non-existent",
        activeSubCollection: null,
        parentLevel: null,
      },
    });

    act(() => {
      window.dispatchEvent(mockPopStateEvent);
    });

    expect(result.current.activeSubCollection).toBeNull();
    expect(result.current.parentLevel).toBeNull();
    expect(mockHistory.replaceState).toHaveBeenCalled();
  });

  it("sets up event listeners correctly", () => {
    renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function)
    );
  });

  it("cleans up event listeners on unmount", () => {
    const { unmount } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function)
    );
  });

  it("prevents memory leaks by not re-registering listeners", () => {
    // Render hook multiple times to simulate re-renders
    const { rerender } = renderHook(
      ({ subCollections, title }) => useNavigationState(subCollections, title),
      {
        initialProps: {
          subCollections: mockSubCollections,
          title: mockCollectionTitle,
        },
      }
    );

    // Change props to trigger re-render
    rerender({ subCollections: [...mockSubCollections], title: "New Title" });

    // Should only register listener once, not on every re-render
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
  });

  it("handles empty subcollections gracefully", () => {
    const { result } = renderHook(() =>
      useNavigationState([], mockCollectionTitle)
    );

    expect(result.current.activeSubCollection).toBeNull();
    expect(result.current.parentLevel).toBeNull();
  });

  it("uses replaceState for fallback scenarios", () => {
    const { result } = renderHook(() =>
      useNavigationState(mockSubCollections, mockCollectionTitle)
    );

    // Navigate to subcollection
    act(() => {
      result.current.handleSubCollectionClick(mockSubCollections[0]);
    });

    // Simulate fallback scenario
    const mockPopStateEvent = new PopStateEvent("popstate", {
      state: {
        activeSubCollectionId: "non-existent",
        activeSubCollection: null,
        parentLevel: null,
      },
    });

    act(() => {
      window.dispatchEvent(mockPopStateEvent);
    });

    expect(mockHistory.replaceState).toHaveBeenCalled();
  });
});
