import React, { useRef, useEffect, useState } from "react";
import { parseTimestamp } from "@/utils";
import { isSafari, getVideoMimeType } from "@/utils/videoUtils";

export default function NativeVideoPreview({
  fileUrl,
  fileExtension,
  thumbnailImage,
  startTimestamp,
  isFileSpecial,
}: {
  fileUrl: string;
  fileExtension: string;
  thumbnailImage: string;
  startTimestamp?: string;
  isFileSpecial?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [browserSupportsVideo, setBrowserSupportsVideo] = useState(false);
  const mov = fileExtension.toLowerCase() === "mov";

  useEffect(() => {
    setBrowserSupportsVideo(isSafari());
  }, []);

  // Set the video start time when metadata is loaded
  useEffect(() => {
    if (startTimestamp && videoRef.current) {
      const startSeconds = parseTimestamp(startTimestamp);
      videoRef.current.currentTime = startSeconds;
    }
  }, [startTimestamp]);

  const containerClass = "overflow-hidden rounded-[14px] w-full";
  const videoClass = isFileSpecial ? "w-full h-full" : "w-full h-full";

  if (mov) {
    return (
      <>
        {browserSupportsVideo ? (
          <div className={containerClass}>
            <video
              ref={videoRef}
              poster={thumbnailImage}
              controls
              className={videoClass}
              playsInline
              onLoadedMetadata={() => {
                if (startTimestamp && videoRef.current) {
                  const startSeconds = parseTimestamp(startTimestamp);
                  videoRef.current.currentTime = startSeconds;
                }
              }}
            >
              <source src={fileUrl} type={getVideoMimeType(fileExtension)} />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            <h2 className="text-primary text-[15px] font-medium">
              Typo URLs are in beta
            </h2>
            <p className="text-xs text-[#7E7E7E]">
              Currently, this file is only supported on Safari
            </p>
          </div>
        )}
      </>
    );
  } else {
    return (
      <div className={containerClass}>
        <video
          ref={videoRef}
          poster={thumbnailImage}
          controls
          preload="auto"
          width="100%"
          className={videoClass}
          playsInline
          onLoadedMetadata={() => {
            if (startTimestamp && videoRef.current) {
              const startSeconds = parseTimestamp(startTimestamp);
              videoRef.current.currentTime = startSeconds;
            }
          }}
        >
          <source src={fileUrl} type={getVideoMimeType(fileExtension)} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
}
