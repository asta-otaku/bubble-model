import React, { useEffect, useRef, useState } from "react";
import { parseTimestamp } from "@/utils";
import MuxVideo from "@mux/mux-video-react";
import "media-chrome/react";
import "media-chrome/react/menu";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaPlayButton,
  MediaFullscreenButton,
  MediaPreviewThumbnail,
  MediaPreviewTimeDisplay,
} from "media-chrome/react";
import NativeVideoPreview from "./NativeVideoPreview";

interface CustomCSSProperties extends React.CSSProperties {
  [key: `--${string}`]: string | number;
}

export default function MuxVideoPreview({
  muxPlaybackId,
  fileUrl,
  fileExtension,
  thumbnailImage,
  startTimestamp,
  width,
  height,
  isFileSpecial,
  showPlayButtonOnly = false,
  accentColor = "rgba(235, 235, 235, 0.75)",
}: {
  muxPlaybackId?: null | string;
  fileUrl?: string;
  fileExtension?: string;
  thumbnailImage: string;
  startTimestamp?: string;
  width?: number;
  height?: number;
  accentColor?: string;
  isFileSpecial?: boolean;
  showPlayButtonOnly?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // If no muxPlaybackId is provided, fall back to the native video preview.
  if (!muxPlaybackId) {
    if (fileUrl && fileExtension) {
      if (typeof NativeVideoPreview !== "undefined") {
        return (
          <NativeVideoPreview
            fileUrl={fileUrl}
            fileExtension={fileExtension}
            thumbnailImage={thumbnailImage}
            startTimestamp={startTimestamp}
          />
        );
      }
    }
    return (
      <div className="w-full min-h-full overflow-hidden rounded-[14px] p-4">
        <h2 className="text-primary text-[15px] font-medium">
          Video source missing
        </h2>
      </div>
    );
  }

  // Calculate dimensions based on container width
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Use 16:9 as default aspect ratio
        const height = Math.floor(width * (9 / 16));
        setDimensions({ width, height });
      }
    };

    // Set initial dimensions
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handle timestamp
  useEffect(() => {
    if (startTimestamp && videoRef.current) {
      const startSeconds = parseTimestamp(startTimestamp);
      videoRef.current.currentTime = startSeconds;
    }
  }, [startTimestamp]);

  // Calculate padding bottom for responsive container
  const paddingBottom = isFileSpecial
    ? "100%" // Square aspect ratio (1:1)
    : width && height
    ? `${(height / width) * 100}%`
    : "56.25%"; // 56.25% is 9/16 for default 16:9

  // Create CSS variables for styling
  const controllerStyle: CustomCSSProperties = {
    "--media-primary-color": "#fff",
    "--media-secondary-color": "rgba(38, 38, 38, 0.75)",
    "--media-accent-color": accentColor,
    "--media-control-background": "transparent",
    "--media-control-hover-background": "transparent",
    "--media-range-thumb-opacity": "0",
    "--media-tooltip-display": "none",
    "--media-range-track-height": "4px",
    "--media-range-bar-color": accentColor,
    "--media-range-track-background": "rgba(38, 38, 38, 0.25)",
    "--media-time-range-buffered-color": "rgba(38, 38, 38, 0.3)",
    "--media-range-padding-left": "0",
    "--media-range-padding-right": "0",
    fontWeight: "bold",
    color: "#fff",
    height: "100%",
    width: "100%",
    maxHeight: isFileSpecial ? "80vh" : "100%",
    position: "absolute",
    top: "0",
    left: "0",
    // Disable pointer events when in preview mode
    pointerEvents: showPlayButtonOnly ? "none" : "auto",
  };

  const playButtonStyle: CustomCSSProperties = {
    "--media-control-background": "rgba(38, 38, 38, 0.75)",
    "--media-control-hover-background": "rgba(38, 38, 38, 0.75)",
    borderRadius: "50%",
    padding: "0.7em",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // Re-enable pointer events for the play button in preview mode
    pointerEvents: showPlayButtonOnly ? "auto" : "auto",
  };

  const fullscreenButtonStyle: CustomCSSProperties = {
    "--media-control-background": "rgba(38, 38, 38, 0.75)",
    "--media-control-hover-background": "rgba(38, 38, 38, 0.75)",
    borderRadius: "50%",
    padding: "0.5em",
    marginLeft: "0.5em",
  };

  const timeRangeStyle: CustomCSSProperties = {
    width: "100%",
    height: "8px",
    position: "absolute",
    bottom: "-3px",
    "--media-preview-thumbnail-width": "160px",
    "--media-preview-thumbnail-height": "90px",
    "--media-range-thumb-height": "14px",
    "--media-range-thumb-width": "14px",
    "--media-range-thumb-border-radius": "7px",
    "--media-preview-thumbnail-border-radius": "4px",
    "--media-preview-box-background": "rgba(0, 0, 0, 0.8)",
    "--media-preview-time-color": "#fff",
    "--media-preview-time-font-size": "12px",
    "--media-preview-time-padding": "4px 8px",
  };

  // If showPlayButtonOnly is true, render a simplified version
  if (showPlayButtonOnly) {
    return (
      <div
        ref={containerRef}
        className={`${
          isFileSpecial
            ? "w-full h-full"
            : "max-w-xs w-full h-full overflow-hidden rounded-[14px]"
        } cursor-pointer`}
      >
        {dimensions.width > 0 && (
          <div
            className={`relative w-full ${isFileSpecial ? "h-full" : ""}`}
            style={isFileSpecial ? { height: "100%" } : { paddingBottom }}
          >
            {/* Static thumbnail with play button overlay */}
            <img
              src={`https://image.mux.com/${muxPlaybackId}/thumbnail.png`}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectFit: isFileSpecial ? "cover" : "contain",
              }}
            />

            {/* Play button overlay */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200">
              <div
                style={playButtonStyle}
                className="flex items-center justify-center"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="30"
                  height="30"
                  className="text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal playable video mode
  return (
    <div
      ref={containerRef}
      className={`${
        isFileSpecial
          ? "w-full h-full"
          : "max-w-xs w-full h-full overflow-hidden rounded-[14px]"
      }`}
    >
      {dimensions.width > 0 && (
        <div
          className={`relative w-full ${isFileSpecial ? "h-full" : ""}`}
          style={isFileSpecial ? { height: "100%" } : { paddingBottom }}
        >
          <MediaController
            style={controllerStyle}
            defaultStreamType="on-demand"
          >
            <MuxVideo
              ref={videoRef}
              slot="media"
              playbackId={muxPlaybackId}
              poster={`https://image.mux.com/${muxPlaybackId}/thumbnail.png`}
              streamType="on-demand"
              playsInline
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: isFileSpecial ? "cover" : "contain",
              }}
            >
              <track
                default
                label="thumbnails"
                kind="metadata"
                src={`https://image.mux.com/${muxPlaybackId}/storyboard.vtt`}
              />
            </MuxVideo>

            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <MediaPlayButton style={playButtonStyle}>
                <span slot="play">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="30"
                    height="30"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span slot="pause">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="30"
                    height="30"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </MediaPlayButton>
            </div>

            {!isFileSpecial && (
              <MediaControlBar
                style={{
                  margin: "0.4em 0.8em",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <MediaFullscreenButton style={fullscreenButtonStyle}>
                  <span slot="enter">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 18.9746 18.6426"
                      width="14"
                      height="14"
                      fill="currentColor"
                    >
                      <path d="M0.898438 7.90039C1.41602 7.90039 1.78711 7.50977 1.78711 6.99219L1.78711 6.17188L1.5918 2.76367L4.16016 5.46875L7.16797 8.49609C7.33398 8.67188 7.54883 8.75 7.7832 8.75C8.33984 8.75 8.75 8.38867 8.75 7.8418C8.75 7.57812 8.66211 7.34375 8.48633 7.16797L5.46875 4.16016L2.76367 1.5918L6.18164 1.78711L6.99219 1.78711C7.50977 1.78711 7.91016 1.42578 7.91016 0.898438C7.91016 0.371094 7.51953 0 6.99219 0L1.57227 0C0.576172 0 0 0.576172 0 1.57227L0 6.99219C0 7.5 0.380859 7.90039 0.898438 7.90039ZM11.6113 18.6328L17.0312 18.6328C18.0273 18.6328 18.6133 18.0566 18.6133 17.0605L18.6133 11.6406C18.6133 11.1328 18.2324 10.7324 17.7051 10.7324C17.1973 10.7324 16.8164 11.123 16.8164 11.6406L16.8164 12.4609L17.0215 15.8691L14.4434 13.1641L11.4453 10.1367C11.2793 9.96094 11.0547 9.88281 10.8203 9.88281C10.2734 9.88281 9.85352 10.2441 9.85352 10.791C9.85352 11.0547 9.95117 11.2891 10.127 11.4648L13.1348 14.4727L15.8496 17.041L12.4316 16.8457L11.6113 16.8457C11.0938 16.8457 10.6934 17.207 10.6934 17.7344C10.6934 18.2617 11.0938 18.6328 11.6113 18.6328Z" />
                    </svg>
                  </span>
                  <span slot="exit">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 19.3945 19.5801"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M1.75781 8.84766L7.17773 8.84766C8.17383 8.84766 8.75 8.26172 8.75 7.26562L8.75 1.85547C8.75 1.34766 8.36914 0.947266 7.85156 0.947266C7.33398 0.947266 6.96289 1.33789 6.96289 1.85547L6.96289 2.67578L7.16797 6.08398L4.58984 3.37891L1.5918 0.351562C1.42578 0.175781 1.20117 0.0878906 0.966797 0.0878906C0.410156 0.0878906 0 0.458984 0 1.00586C0 1.25977 0.0976562 1.50391 0.273438 1.67969L3.28125 4.6875L5.98633 7.25586L2.57812 7.06055L1.75781 7.06055C1.24023 7.06055 0.839844 7.42188 0.839844 7.94922C0.839844 8.4668 1.23047 8.84766 1.75781 8.84766ZM11.123 18.7598C11.6406 18.7598 12.0117 18.3789 12.0117 17.8516L12.0117 16.9238L11.8066 13.5254L14.3848 16.2305L17.4512 19.3164C17.6172 19.4922 17.832 19.5801 18.0762 19.5801C18.623 19.5801 19.0332 19.209 19.0332 18.6621C19.0332 18.4082 18.9453 18.1641 18.7695 17.9883L15.6934 14.9121L12.9785 12.3438L16.3965 12.5391L17.3242 12.5391C17.8418 12.5391 18.2422 12.1777 18.2422 11.6602C18.2422 11.1328 17.8516 10.7617 17.3242 10.7617L11.7969 10.7617C10.8008 10.7617 10.2246 11.3379 10.2246 12.334L10.2246 17.8516C10.2246 18.3691 10.5957 18.7598 11.123 18.7598Z" />
                    </svg>
                  </span>
                </MediaFullscreenButton>
              </MediaControlBar>
            )}

            <MediaTimeRange style={timeRangeStyle}>
              <MediaPreviewThumbnail slot="preview" />
              <MediaPreviewTimeDisplay slot="preview" />
            </MediaTimeRange>
          </MediaController>
        </div>
      )}
    </div>
  );
}
