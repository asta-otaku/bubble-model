
export const truncateFilename = (filename: string) => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) return filename;

    const extension = filename.slice(lastDotIndex);
    const baseName = filename.slice(0, lastDotIndex);

    if (baseName.length <= 10) return filename;

    return `${baseName.slice(0, 5)}...${extension}`;
  };

  