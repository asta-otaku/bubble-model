import { useEffect, useRef, useState } from "react";
import videojs from "@mux/videojs-kit/dist/index.vhs.js";
// import "video.js/dist/video-js.css";
import "@mux/videojs-kit/dist/index.css";
import { parseTimestamp } from "@/utils";
import { isSafari } from "@/utils/videoUtils";
import { getVideoMimeType } from "@/utils/videoUtils";
// import { customControls } from "@/utils/customControls"; // This still a WIP

export default function MuxVideoJSPreview({
  muxPlaybackId,
  startTimestamp,
  isFileSpecial,
}: {
  muxPlaybackId: string;
  startTimestamp?: string;
  isFileSpecial?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const initializePlayer = setTimeout(() => {
      const player = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        responsive: true,
        playsinline: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        timelineHoverPreviews: true,
        userActions: { hotkeys: true },
        plugins: {
          mux: { debug: false, data: { video_title: "Video Preview" } },
          httpSourceSelector: {},
        },
      });

      player.src({ src: muxPlaybackId, type: "video/mux" });
      playerRef.current = player;

      if (startTimestamp) {
        const startSeconds = parseTimestamp(startTimestamp);
        player.ready(() => {
          player.currentTime(startSeconds);
        });
      }

      return () => {
        clearTimeout(initializePlayer);
        playerRef.current?.dispose();
      };
    }, 0);

    return () => clearTimeout(initializePlayer);
  }, [muxPlaybackId]);

  useEffect(() => {
    if (startTimestamp && playerRef.current) {
      const startSeconds = parseTimestamp(startTimestamp);
      playerRef.current.currentTime(startSeconds);
    }
  }, [startTimestamp]);

  return (
    <div
      className={`w-full min-h-full overflow-hidden ${
        isFileSpecial ? "" : "rounded-[14px]"
      }`}
    >
      <video
        ref={videoRef}
        className="video-js vjs-16-9 vjs-fluid vjs-big-play-centered rounded-[14px]"
        controls
        preload="auto"
        width="100%"
      />
    </div>
  );
}

type VanillaVideoJSPreviewProps = {
  fileUrl: string;
  fileExtension: string;
  thumbnailImage: string;
  startTimestamp?: string;
  isFileSpecial?: boolean;
};

export function VanillaVideoJSPreview({
  fileUrl,
  fileExtension,
  thumbnailImage,
  startTimestamp,
  isFileSpecial,
}: VanillaVideoJSPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [browserSupportsVideo] = useState(isSafari());

  // Determine if the file is an MOV file.
  const isMov = fileExtension.toLowerCase() === "mov";

  useEffect(() => {
    if (!videoRef.current) return;
    const initializePlayer = setTimeout(() => {
      // Initialize Video.js (vanilla version, without mux plugin)
      const player = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        responsive: true,
        playsinline: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        timelineHoverPreviews: true,
        userActions: { hotkeys: true },
        poster: thumbnailImage,
      });
      player.src({ src: fileUrl, type: getVideoMimeType(fileExtension) });
      playerRef.current = player;
      //   customControls(player);
      if (startTimestamp) {
        const startSeconds = parseTimestamp(startTimestamp);
        player.ready(() => {
          player.currentTime(startSeconds);
        });
      }
      return () => {
        clearTimeout(initializePlayer);
        playerRef.current?.dispose();
      };
    }, 0);
    return () => clearTimeout(initializePlayer);
  }, [fileUrl, fileExtension, thumbnailImage, startTimestamp]);

  useEffect(() => {
    if (startTimestamp && playerRef.current) {
      const startSeconds = parseTimestamp(startTimestamp);
      playerRef.current.currentTime(startSeconds);
    }
  }, [startTimestamp]);

  return (
    <div
      className={`w-full min-h-full overflow-hidden ${
        isFileSpecial ? "" : "rounded-[14px]"
      }`}
    >
      {isMov && !browserSupportsVideo ? (
        <div className="space-y-1 p-4">
          <h2 className="text-primary text-[15px] font-medium">
            Typo URLs are in beta
          </h2>
          <p className="text-xs text-[#7E7E7E]">
            Currently, this file is only supported on Safari
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="video-js vjs-16-9 vjs-fluid vjs-big-play-centered rounded-[14px]"
          controls
          preload="auto"
          width="100%"
          playsInline
        />
      )}
    </div>
  );
}
