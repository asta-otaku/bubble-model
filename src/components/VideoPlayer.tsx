import { useEffect, useRef } from "react";
import videojs from "@mux/videojs-kit/dist/index.vhs.js";
import vanillaVideoJS from "video.js";
import "video.js/dist/video-js.css";
import "@mux/videojs-kit/dist/index.css";
import { parseTimestamp } from "@/utils";

const setupCustomControls = (player: any) => {
  // Add skip forward button (5 seconds)
  player.controlBar.addChild(
    "button",
    {
      text: "⏩",
      className: "vjs-skip-forward-button",
      handler: function (this: any) {
        const skipAmount = 5;
        player.currentTime(
          Math.min(player.currentTime() + skipAmount, player.duration())
        );
      },
    },
    player.controlBar.children_.length - 1
  ); // Insert before fullscreen button

  // Add skip backward button (5 seconds)
  player.controlBar.addChild(
    "button",
    {
      text: "⏪",
      className: "vjs-skip-backward-button",
      handler: function (this: any) {
        const skipAmount = 5;
        player.currentTime(Math.max(player.currentTime() - skipAmount, 0));
      },
    },
    player.controlBar.children_.length - 2
  ); // Insert before forward button

  // Add playback speed button if not already present
  if (!player.controlBar.getChild("playbackRateMenuButton")) {
    player.controlBar.addChild(
      "playbackRateMenuButton",
      {
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      },
      player.controlBar.children_.length - 3
    );
  }

  // Enable keyboard seeking
  player.on("keydown", function (event: KeyboardEvent) {
    // Left arrow key - seek back 5 seconds
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      player.currentTime(Math.max(player.currentTime() - 5, 0));
    }

    // Right arrow key - seek forward 5 seconds
    else if (event.key === "ArrowRight") {
      event.preventDefault();
      player.currentTime(Math.min(player.currentTime() + 5, player.duration()));
    }

    // Up arrow key - increase volume
    else if (event.key === "ArrowUp") {
      event.preventDefault();
      player.volume(Math.min(player.volume() + 0.1, 1));
    }

    // Down arrow key - decrease volume
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      player.volume(Math.max(player.volume() - 0.1, 0));
    }

    // Spacebar - toggle play/pause
    else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (player.paused()) {
        player.play();
      } else {
        player.pause();
      }
    }

    // 'M' key - toggle mute
    else if (event.key === "m" || event.key === "M") {
      event.preventDefault();
      player.muted(!player.muted());
    }

    // Numbers 0-9 - seek to percentage of video
    else if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      const percent = parseInt(event.key) * 10;
      player.currentTime((player.duration() * percent) / 100);
    }
  });

  // Style the custom buttons
  const style = document.createElement("style");
  style.textContent = `
    .vjs-skip-forward-button,
    .vjs-skip-backward-button {
      font-size: 0.8em;
      cursor: pointer;
    }
    .video-js .vjs-time-control {
      display: block;
    }
    .video-js .vjs-remaining-time {
      display: none;
    }
    .video-js:focus {
      outline: none;
    }
  `;
  document.head.appendChild(style);
};

export default function VideoJSPreview({
  muxPlaybackId,
  startTimestamp,
}: {
  muxPlaybackId: string;
  startTimestamp?: string;
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
    <div className="w-full min-h-full overflow-hidden rounded-[14px]">
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

export function NativeVideoPreview({
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
  const playerRef = useRef<any>(null);

  const getVideoMimeType = (extension: string) => {
    const extensionToMimeType: { [key: string]: string } = {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      MOV: "video/quicktime",
    };
    return extensionToMimeType[extension] || `video/${extension}`;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const initializePlayer = setTimeout(() => {
      const player = vanillaVideoJS(videoRef.current, {
        controls: true,
        fluid: true,
        responsive: true,
        playsinline: true,
        poster: thumbnailImage,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        userActions: { hotkeys: true },
        sources: [{ src: fileUrl, type: getVideoMimeType(fileExtension) }],
      });

      playerRef.current = player;
      setupCustomControls(player);

      if (startTimestamp) {
        const startSeconds = parseTimestamp(startTimestamp);
        player.ready(() => {
          player.currentTime(startSeconds);
        });
      }
    }, 0);

    return () => {
      clearTimeout(initializePlayer);
      playerRef.current?.dispose();
    };
  }, [fileUrl, fileExtension, thumbnailImage]);

  useEffect(() => {
    if (startTimestamp && playerRef.current) {
      const startSeconds = parseTimestamp(startTimestamp);
      playerRef.current.currentTime(startSeconds);
    }
  }, [startTimestamp]);

  return (
    <div className="w-full min-h-full overflow-hidden rounded-[14px]">
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
