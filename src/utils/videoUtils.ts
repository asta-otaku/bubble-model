import { lookup as mimeLookup } from "mime-types";

export const getVideoMimeType = (extension: string): string => {
  // Ensures the extension starts with a dot.
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return mimeLookup(ext) || `video/${extension}`;
};

export const isSafari = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android")
  );
};
