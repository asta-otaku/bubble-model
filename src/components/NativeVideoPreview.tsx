import React, { useRef, useEffect, useState } from "react";
import { parseTimestamp } from "@/utils";
import { isSafari , getVideoMimeType } from "@/utils/videoUtils";

export default function NativeVideoPreview({
  fileUrl,
  fileExtension,
  thumbnailImage,
  startTimestamp,
}: {
  fileUrl: string;
  fileExtension: string;
  thumbnailImage: string;
  startTimestamp?: string;
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

  if (mov) {
    return (
      <>
        {browserSupportsVideo ? (
          <div className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px]">
            <video
              ref={videoRef}
              poster={thumbnailImage}
              controls
              className="w-full h-auto"
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
    <div className="w-full min-h-full overflow-hidden rounded-[14px]">
      <video
        ref={videoRef}
        poster={thumbnailImage}
        controls
        preload="auto"
        width="100%"
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
}}
