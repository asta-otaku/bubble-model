import { useState, useEffect, useRef } from "react";

export const useScrollState = () => {
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollPosition = () => {
      const element = contentRef.current;
      if (!element) {
        console.log("No element found");
        return;
      }

      const scrollTop = element.scrollTop;
      const shouldShow = scrollTop > 50;
      
      console.log("=== Scroll Check ===");
      console.log("Element:", element);
      console.log("ScrollTop:", scrollTop);
      console.log("Should show gradient:", shouldShow);
      console.log("Current gradient state:", showTopGradient);
      
      if (shouldShow !== showTopGradient) {
        console.log("🔄 Updating gradient state to:", shouldShow);
        setShowTopGradient(shouldShow);
      }

      // Bottom gradient logic
      const { scrollHeight, clientHeight } = element;
      const downloadButtonHeight = 80;
      const hasContentOverflow = scrollTop + clientHeight < scrollHeight;
      const wouldOverlapButton = scrollHeight > clientHeight - downloadButtonHeight;
      
      setShowBottomGradient(hasContentOverflow && wouldOverlapButton);
    };

    // Wait for next tick to ensure element is mounted
    const timer = setTimeout(() => {
      console.log("Initial scroll check...");
      checkScrollPosition();
    }, 0);

    const element = contentRef.current;
    if (element) {
      console.log("✅ Adding scroll listeners to element:", element);
      element.addEventListener("scroll", checkScrollPosition, { passive: true });
      
      // Test scroll listener immediately
      setTimeout(() => {
        console.log("🧪 Testing scroll listener...");
        element.scrollTop = 100;
        setTimeout(() => {
          element.scrollTop = 0;
        }, 100);
      }, 1000);
    } else {
      console.log("❌ No element to add listeners to");
    }

    window.addEventListener("resize", checkScrollPosition);

    return () => {
      clearTimeout(timer);
      if (element) {
        element.removeEventListener("scroll", checkScrollPosition);
        console.log("🧹 Removed scroll listeners");
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []); // Empty dependency array

  return {
    showTopGradient,
    showBottomGradient,
    contentRef,
  };
};