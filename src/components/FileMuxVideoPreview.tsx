import React, { useEffect, useRef, useState } from "react";
import { parseTimestamp } from "@/utils";
import MuxVideo from '@mux/mux-video-react';
import 'media-chrome/react';
import 'media-chrome/react/menu';
import { MediaTheme } from "media-chrome/react/media-theme";
import { injectYTTheme } from "@/utils/injectYTTheme";
import NativeVideoPreview from "./NativeVideoPreview";


export default function FileMuxVideoPreview({
  muxPlaybackId,
  fileUrl,
  fileExtension,
  thumbnailImage,
  startTimestamp,
  width,
  height,
  isFileSpecial,
  accentColor = "rgba(235, 235, 235, 0.75)"
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
}) {

    // If no muxPlaybackId is provided, fall back to the native video preview.
    if (!muxPlaybackId ) {
        if (fileUrl && fileExtension) {
          if (typeof NativeVideoPreview !== 'undefined') {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ytTpl, setYtTpl] = useState<HTMLTemplateElement>();

useEffect(() => {
  setYtTpl(injectYTTheme());
}, []);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setDimensions({ width: w, height: Math.floor(w * 9 / 16) });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (startTimestamp && videoRef.current) {
      videoRef.current.currentTime = parseTimestamp(startTimestamp);
    }
  }, [startTimestamp]);

  const paddingBottom =
    width && height ? `${(height / width) * 100}%` : "56.25%";

  return (
    <div className="w-full h-full flex items-center justify-center">
    <div
      ref={containerRef}
      className={
        isFileSpecial
          ? "w-full h-full"
          : "max-w-xs w-full overflow-hidden rounded-[14px]"
      }
    >
      {dimensions.width > 0 && (
        <div className="relative w-full" style={{ paddingBottom }}>
          {/* ---- YT-skinned media-controller ---- */}
          {ytTpl && (
            <MediaTheme template={ytTpl} style={{ width: "100%", height: "100%" }}>
            <MuxVideo
              slot="media"
              ref={videoRef}
              playbackId={muxPlaybackId!}
              poster={`https://image.mux.com/${muxPlaybackId}/thumbnail.png`}
              streamType="on-demand"
              playsInline
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%" }}
            >
              <track
                default
                label="thumbnails"
                kind="metadata"
                src={`https://image.mux.com/${muxPlaybackId}/storyboard.vtt`}
              />
            </MuxVideo>
          </MediaTheme>
          )}
        </div>
      )}
    </div>
    </div>
  );
}