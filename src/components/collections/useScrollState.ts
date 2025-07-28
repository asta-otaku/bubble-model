import { useState, useEffect, useRef } from "react";

export const useScrollState = () => {
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setShowTopGradient(scrollTop > 0);

      const downloadButtonHeight = 80;
      const hasContentOverflow = scrollTop + clientHeight < scrollHeight;
      const wouldOverlapButton =
        scrollHeight > clientHeight - downloadButtonHeight;

      setShowBottomGradient(hasContentOverflow && wouldOverlapButton);
    }
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      checkScrollPosition();
      contentElement.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        contentElement.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, []);

  return {
    showTopGradient,
    showBottomGradient,
    contentRef,
  };
}; 