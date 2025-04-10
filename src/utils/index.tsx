import { useState, useEffect } from "react";

export function formatTime(seconds: number) {
  if (seconds === 0) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
export const parseTimestamp = (timestamp: string): number => {
  const [minutes, seconds] = timestamp.split(":").map(Number);
  return minutes * 60 + seconds;
};

const useIsMobile = (breakpoint = 768): boolean => {
  // Initialize state based on the initial window width if available.
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add event listener for window resize.
    window.addEventListener("resize", handleResize);

    // Check initial size in case it changed.
    handleResize();

    // Clean up the event listener on component unmount.
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
