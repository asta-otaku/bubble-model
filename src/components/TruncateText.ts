export const truncateFilename = (
  filename: string,
  longText: boolean = false
) => {
  if (!filename) return "";
  const sanitizedFilename = filename.replace(/:/g, "-");

  const lastDotIndex = sanitizedFilename.lastIndexOf(".");

  if (lastDotIndex === -1) return sanitizedFilename;

  const extension = sanitizedFilename.slice(lastDotIndex);
  const baseName = sanitizedFilename.slice(0, lastDotIndex);

  if (baseName.length <= (longText ? 18 : 6)) return sanitizedFilename;

  const result = `${baseName.slice(0, longText ? 17 : 5)}...${extension}`;

  return result;
};
