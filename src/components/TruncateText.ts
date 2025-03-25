
export const truncateFilename = (filename: string, longText: boolean = false) => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) return filename;

    const extension = filename.slice(lastDotIndex);
    const baseName = filename.slice(0, lastDotIndex);

    if (baseName.length <= (longText ? 18 : 6)) return filename;

    return `${baseName.slice(0, (longText ? 17 : 5))}...${extension}`;
  };

  