import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Navigation state interface
interface NavigationState {
  activeSubCollectionId: string | null;
  activeSubCollection: any | null;
  parentLevel: { id: string; name: string; type: string } | null;
}

interface ParentLevel {
  id: string;
  name: string;
  type: string;
}

export const useNavigationState = (subCollections: any[], collectionTitle: string) => {
  const pathname = usePathname();
  const [activeSubCollection, setActiveSubCollection] = useState<any | null>(null);
  const [parentLevel, setParentLevel] = useState<ParentLevel | null>(null);

  // Helper to find subcollection by ID recursively
  const findSubCollectionById = (id: string): any | null => {
    if (!subCollections || subCollections.length === 0) {
      return null;
    }

    const findInSubs = (subs: any[]): any | null => {
      for (const sub of subs) {
        if (sub.rootCollection?.id === id) {
          return sub;
        }
        if (sub.subCollections) {
          const found = findInSubs(sub.subCollections);
          if (found) return found;
        }
      }
      return null;
    };
    return findInSubs(subCollections);
  };

  // Helper to find parent of a subcollection
  const findParentOfSubCollection = (targetId: string): ParentLevel | null => {
    const findParentInSubs = (
      subs: any[],
      parentInfo: ParentLevel
    ): ParentLevel | null => {
      for (const sub of subs) {
        if (sub.rootCollection?.id === targetId) {
          return parentInfo;
        }
        if (sub.subCollections) {
          const found = findParentInSubs(sub.subCollections, {
            id: sub.rootCollection?.id,
            name: sub.rootCollection?.name || "Untitled",
            type: "subcollection",
          });
          if (found) return found;
        }
      }
      return null;
    };

    // Check if target is a direct child of main collection
    for (const sub of subCollections) {
      if (sub.rootCollection?.id === targetId) {
        return {
          id: "root",
          name: collectionTitle,
          type: "collection",
        };
      }
    }

    // Check nested subcollections
    return findParentInSubs(subCollections, {
      id: "root",
      name: collectionTitle,
      type: "collection",
    });
  };

  // Update browser history without changing URL
  const updateHistoryState = (
    subCollection: any | null,
    parent: ParentLevel | null
  ) => {
    const state: NavigationState = {
      activeSubCollectionId: subCollection?.rootCollection?.id || null,
      activeSubCollection: subCollection,
      parentLevel: parent,
    };

    // Push new history entry to enable back/forward navigation
    window.history.pushState(state, "", pathname);
    console.log("History state updated:", state);
  };

  // Handle browser back/forward navigation
  const handlePopState = (event: PopStateEvent) => {
    console.log("PopState event triggered:", event.state);
    const state = event.state as NavigationState | null;

    if (state?.activeSubCollectionId) {
      const subCollection = findSubCollectionById(state.activeSubCollectionId);
      if (subCollection) {
        setActiveSubCollection(subCollection);
        setParentLevel(state.parentLevel);
        console.log(
          "Restored subcollection:",
          subCollection.rootCollection?.name
        );
      } else {
        // If subcollection not found, fall back to main collection
        setActiveSubCollection(null);
        setParentLevel(null);
        updateHistoryState(null, null);
        console.log("Subcollection not found, falling back to main collection");
      }
    } else {
      setActiveSubCollection(null);
      setParentLevel(null);
      console.log("No active subcollection, showing main collection");
    }
  };

  // When a subcollection card is clicked, show its contents and update history
  const handleSubCollectionClick = (sub: any) => {
    // Set the current level as parent for the new subcollection
    const newParent = {
      id: activeSubCollection?.rootCollection?.id || "root",
      name: activeSubCollection?.rootCollection?.name || collectionTitle,
      type: activeSubCollection ? "subcollection" : "collection",
    };

    setParentLevel(newParent);
    setActiveSubCollection(sub);
    updateHistoryState(sub, newParent);
  };

  // Back to parent collection/subcollection
  const handleBackToParent = () => {
    if (parentLevel) {
      if (parentLevel.type === "collection") {
        // Go back to main collection
        setActiveSubCollection(null);
        setParentLevel(null);
        updateHistoryState(null, null);
      } else if (parentLevel.type === "subcollection") {
        // Go back to parent subcollection
        const parentSubCollection = findSubCollectionById(parentLevel.id);
        if (parentSubCollection) {
          // Find the parent of the parent subcollection
          const grandParent = findParentOfSubCollection(parentLevel.id);
          setActiveSubCollection(parentSubCollection);
          setParentLevel(grandParent);
          updateHistoryState(parentSubCollection, grandParent);
        } else {
          // Fallback to main collection
          setActiveSubCollection(null);
          setParentLevel(null);
          updateHistoryState(null, null);
        }
      }
    } else {
      // Fallback to main collection
      setActiveSubCollection(null);
      setParentLevel(null);
      updateHistoryState(null, null);
    }
  };

  // Set up browser navigation listeners
  useEffect(() => {
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [subCollections]);

  // Initialize history state on first load
  useEffect(() => {
    if (subCollections.length > 0 && !window.history.state) {
      console.log("Setting initial history state");
      updateHistoryState(null, null);
    }
  }, [subCollections]);

  // Restore navigation state after subcollections are loaded
  useEffect(() => {
    if (subCollections.length > 0) {
      const currentState = window.history.state as NavigationState | null;
      console.log("Checking for state restoration:", currentState);
      if (currentState?.activeSubCollectionId) {
        const subCollection = findSubCollectionById(
          currentState.activeSubCollectionId
        );
        if (subCollection) {
          setActiveSubCollection(subCollection);
          setParentLevel(currentState.parentLevel);
        } else {
          updateHistoryState(null, null);
        }
      }
    }
  }, [subCollections]);

  return {
    activeSubCollection,
    parentLevel,
    handleSubCollectionClick,
    handleBackToParent,
  };
}; 