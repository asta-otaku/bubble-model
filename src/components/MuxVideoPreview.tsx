import React, { useEffect, useRef } from "react";
import { parseTimestamp } from "@/utils";
import MuxPlayer from "@mux/mux-player-react";
import NativeVideoPreview from "./NativeVideoPreview";

export default function MuxVideoPreview({
  muxPlaybackId,
  fileUrl,
  fileExtension,
  thumbnailImage,
  startTimestamp,
}: {
  muxPlaybackId?: string;
  fileUrl?: string;
  fileExtension?: string;
  thumbnailImage: string;
  startTimestamp?: string;
}) {
  // If no muxPlaybackId is provided, fall back to the native video preview.
  if (!muxPlaybackId) {
    if (fileUrl && fileExtension) {
      return (
        <NativeVideoPreview
          fileUrl={fileUrl}
          fileExtension={fileExtension}
          thumbnailImage={thumbnailImage}
          startTimestamp={startTimestamp}
        />
      );
    }
    return (
      <div className="w-full min-h-full overflow-hidden rounded-[14px] p-4">
        <h2 className="text-primary text-[15px] font-medium">
          Video source missing
        </h2>
      </div>
    );
  }

  const muxPlayerRef = useRef<any>(null);

  useEffect(() => {
    if (startTimestamp && muxPlayerRef.current) {
      const startSeconds = parseTimestamp(startTimestamp);
      muxPlayerRef.current.currentTime = startSeconds;
    }
  }, [startTimestamp]);

  return (
    <div className="max-w-xs w-full min-h-full overflow-hidden rounded-[14px]">
      <MuxPlayer
        ref={muxPlayerRef}
        playbackId={muxPlaybackId}
        poster={thumbnailImage}
        className="w-full h-auto"
        {...{ controls: true }}
      />
    </div>
  );
}
