import * as React from "react";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import PauseIcon from "../assets/Pause.svg";
import PlayIcon from "../assets/Play.svg";
import backTimer from "@/assets/backTimer.svg";
import forwardTimer from "@/assets/forwardTimer.svg";
import Subtract from "../assets/Subtract.svg";
import { useWavesurfer } from "@wavesurfer/react";
import { formatTime, parseTimestamp } from "@/utils";

interface AudioPlayerProps {
  audioUrl: string;
  filename: string;
  fileSize: string;
  startTime?: string;
  isFileSpecial?: boolean;
  isBubbleSpecial?: boolean;
}
const PEAKS_CDN = process.env.NEXT_PUBLIC_PEAKS_CDN!;

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  filename,
  fileSize,
  startTime,
  isFileSpecial,
  isBubbleSpecial,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState<number | null>(null);
  const wasPlayingRef = useRef(false);

  // Determine if scrubbing should be enabled
  const enableScrubbing = isFileSpecial && !isBubbleSpecial;

  // Configure WaveSurfer
  const { wavesurfer, isPlaying } = useWavesurfer({
    barWidth: 1.5,
    barGap: 1.5,
    cursorWidth: enableScrubbing ? 4 : 0,
    cursorColor: enableScrubbing ? "#2C6BF8" : "transparent",
    container: containerRef,
    height: isFileSpecial ? 100 : startTime ? 49 : 80,
    waveColor: "rgba(233, 233, 233, 1)",
    progressColor: "rgba(25, 25, 25, 0.7)",
    plugins: useMemo(() => [], []),
    normalize: true,
    interact: true,
    // Add performance options
    backend: 'MediaElement', // Better streaming support
    mediaControls: false,
    autoplay: false
  });

  useEffect(() => {
    if (!wavesurfer) return;
    let canceled = false;
    const audioPath = new URL(audioUrl).pathname;
    const peaksPath = audioPath.replace(/\.[^.]+$/, ".peaks.json");
    const peaksUrl = PEAKS_CDN + peaksPath;

    // Configure wavesurfer for better loading performance
    if (wavesurfer.options) {
      // Enable backend options for faster loading
      wavesurfer.options.backend = 'MediaElement';
      wavesurfer.options.mediaControls = false;
      wavesurfer.options.autoplay = false;
    }

    // Fetch peaks data first to display waveform while audio loads
    fetch(peaksUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch peaks");
        return res.json();
      })
      .then((data: { peaks: number[] }) => {
        if (canceled) return;
        
        // Load with peaks data
        wavesurfer.load(audioUrl, [data.peaks]);
      })
      .catch((err) => {
        console.error("Error loading peaks:", err);
        if (!canceled) {
          console.log("Falling back to client-side decoding");
          // Fallback to standard loading
          wavesurfer.load(audioUrl);
        }
      });

    return () => {
      canceled = true;
    };
  }, [wavesurfer, audioUrl]);

  const handlePlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  }, [wavesurfer]);

  const handleSkip = useCallback(
    (seconds: number) => {
      if (!wavesurfer) return;
      const current = wavesurfer.getCurrentTime();
      const duration = wavesurfer.getDuration();
      let newTime = current + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      wavesurfer.setTime(newTime);
    },
    [wavesurfer]
  );

  // If startTime is provided, jump to that point once ready
  useEffect(() => {
    if (wavesurfer && startTime) {
      const startSeconds = parseTimestamp(startTime);
      if (wavesurfer.getDuration() > 0) {
        wavesurfer.setTime(startSeconds);
        setCurrentTime(formatTime(startSeconds) || "00:00");
      }
    }
  }, [wavesurfer, startTime]);

  useEffect(() => {
    if (wavesurfer) {
      const updateTime = () => {
        const current = wavesurfer.getCurrentTime();
        setCurrentTime(formatTime(current) || "00:00");

        // Update playhead position for timestamp display
        if (containerRef.current && wavesurfer.getDuration() > 0) {
          const containerWidth = containerRef.current.offsetWidth;
          const percentComplete = current / wavesurfer.getDuration();
          setPlayheadPosition(containerWidth * percentComplete);
        }
      };

      const handleReady = () => {
        const duration = wavesurfer.getDuration();
        setTotalDuration(formatTime(duration) || "00:00");

        // Jump to startTime on first load
        if (startTime && !isInitialized) {
          const startSeconds = parseTimestamp(startTime);
          if (startSeconds <= duration) {
            wavesurfer.setTime(startSeconds);
            setCurrentTime(formatTime(startSeconds) || "00:00");
            setIsInitialized(true);
          }
        }

        // Initial playhead position
        updateTime();
      };

      // Add simple click handler
      const handleSimpleClick = (event: MouseEvent) => {
        if (!containerRef.current || !wavesurfer) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percent = x / rect.width;

        if (wavesurfer.getDuration() > 0) {
          wavesurfer.setTime(wavesurfer.getDuration() * percent);
        }
      };

      // Add simple touch handler for mobile
      const handleSimpleTouch = (event: TouchEvent) => {
        if (!containerRef.current || !wavesurfer || !event.touches[0]) return;

        // Prevent scrolling
        event.preventDefault();

        const rect = containerRef.current.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1); // Clamp between 0 and 1

        if (wavesurfer.getDuration() > 0) {
          wavesurfer.setTime(wavesurfer.getDuration() * percent);
        }
      };

      wavesurfer.on("ready", handleReady);
      wavesurfer.on("timeupdate", updateTime);
      wavesurfer.on("seeking", updateTime);

      // Add direct click listeners to the container
      if (!enableScrubbing && containerRef.current) {
        containerRef.current.addEventListener("click", handleSimpleClick);
        containerRef.current.addEventListener("touchstart", handleSimpleTouch, {
          passive: false,
        });
      }

      return () => {
        wavesurfer.un("ready", handleReady);
        wavesurfer.un("timeupdate", updateTime);
        wavesurfer.un("seeking", updateTime);

        if (containerRef.current) {
          containerRef.current.removeEventListener("click", handleSimpleClick);
          containerRef.current.removeEventListener(
            "touchstart",
            handleSimpleTouch,
            { passive: false } as EventListenerOptions
          );
        }
      };
    }
  }, [wavesurfer, startTime, isInitialized, enableScrubbing]);

  useEffect(() => {
    if (isScrubbing) {
      document.body.classList.add("scrubbing-active");
    } else if (isFileSpecial && !isBubbleSpecial) {
    } else {
      document.body.classList.remove("scrubbing-active");
    }

    return () => {
      // Only clean up if not in file-special view for audio
      if (!(isFileSpecial && !isBubbleSpecial)) {
        document.body.classList.remove("scrubbing-active");
      }
    };
  }, [isScrubbing, isFileSpecial, isBubbleSpecial]);

  // Setup real-time scrubbing for file-special view
  useEffect(() => {
    if (!wavesurfer || !enableScrubbing || !containerRef.current) return;
    const el = containerRef.current;
    let rafId: number;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") e.preventDefault();
      wasPlayingRef.current = wavesurfer.isPlaying();
      if (wasPlayingRef.current) wavesurfer.pause();
      el.setPointerCapture(e.pointerId);
      setIsScrubbing(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isScrubbing) return;
      if (e.pointerType === "touch") e.preventDefault();

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const pct = Math.min(
          Math.max((e.clientX - rect.left) / rect.width, 0),
          1
        );
        wavesurfer.seekTo(pct);
        setCurrentTime(formatTime(pct * wavesurfer.getDuration())!);
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      // ensure we always jump, even if the user just tapped
      const rect = el.getBoundingClientRect();
      const pct = Math.min(
        Math.max((e.clientX - rect.left) / rect.width, 0),
        1
      );
      wavesurfer.seekTo(pct);
      setCurrentTime(formatTime(pct * wavesurfer.getDuration())!);

      // clean up
      if (e.pointerType === "touch") e.preventDefault();
      el.releasePointerCapture(e.pointerId);
      cancelAnimationFrame(rafId);
      setIsScrubbing(false);

      // resume playback only if it was playing before
      if (wasPlayingRef.current) wavesurfer.play();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
    };
  }, [wavesurfer, enableScrubbing, isScrubbing]);

  // Setup click/touch handler for non-scrubbing mode
  useEffect(() => {
    if (wavesurfer && !enableScrubbing && containerRef.current) {
      // Handler for mouse clicks
      const handleClick = (e: MouseEvent) => {
        if (!wavesurfer || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        const duration = wavesurfer.getDuration();
        wavesurfer.setTime(duration * percent);
      };

      // Handler for touch events (mobile)
      const handleTouch = (e: TouchEvent) => {
        if (!wavesurfer || !containerRef.current || e.touches.length === 0)
          return;

        // Prevent default to avoid scrolling or zooming
        e.preventDefault();

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1); // Clamp between 0 and 1
        const duration = wavesurfer.getDuration();

        // Just seek without trying to play
        if (duration > 0) {
          wavesurfer.setTime(duration * percent);

          // Update current time immediately for visual feedback
          const newTime = duration * percent;
          setCurrentTime(formatTime(newTime) || "00:00");
        }
      };

      const element = containerRef.current;
      element.addEventListener("click", handleClick);
      element.addEventListener("touchstart", handleTouch, { passive: false });

      return () => {
        element.removeEventListener("click", handleClick);
        element.removeEventListener("touchstart", handleTouch, {
          passive: false,
        } as EventListenerOptions);
      };
    }
  }, [wavesurfer, enableScrubbing]);

  // Keyboard controls for file-special view
  useEffect(() => {
    if (!isFileSpecial || !wavesurfer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for these keys to avoid page scrolling
      if (
        e.code === "Space" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight"
      ) {
        e.preventDefault();
      }

      // Only handle keyboard events if not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          handlePlayPause();
          break;
        case "ArrowLeft":
          handleSkip(-15); // Rewind 15 seconds
          break;
        case "ArrowRight":
          handleSkip(15); // Fast forward 15 seconds
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [wavesurfer, isFileSpecial, handlePlayPause, handleSkip]);

  return (
    <>
      {isFileSpecial ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-full bg-white mb-24 relative">
            <div className="px-4 w-full h-full">
              <div
                ref={containerRef}
                className={`relative flex-1 ${
                  enableScrubbing
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer"
                } touch-none`}
                style={{ touchAction: enableScrubbing ? "none" : "auto" }}
              />
            </div>
            {/* Timestamp above playhead */}
            {playheadPosition !== null && containerRef.current && (
              <div
                className="absolute font-mono text-xs text-blue-500 bg-white px-2 py-0.5 rounded shadow-sm"
                style={{
                  left: `${playheadPosition}px`,
                  top: "-24px",
                }}
              >
                {currentTime}
              </div>
            )}
          </div>

          <div className="absolute bottom-[10%]">
            <p className="font-mono text-xs text-primary mb-4">
              {currentTime} / {totalDuration}
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => handleSkip(-15)}>
                <Image src={backTimer} alt="Back 15 seconds" />
              </button>
              <button onClick={handlePlayPause} className="w-8 h-8">
                {isPlaying && !isScrubbing ? (
                  <Image
                    src={PauseIcon}
                    alt="Pause"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={PlayIcon}
                    alt="Play"
                    className="w-full h-full object-cover"
                  />
                )}
              </button>

              <button onClick={() => handleSkip(15)}>
                <Image src={forwardTimer} alt="Forward 15 seconds" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // STANDARD STYLE BRANCH
        <div className="max-w-xs w-full p-3 flex flex-col gap-3 rounded-[14px] bg-white border border-solid border-[#1919191a]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium max-w-40 truncate text-[#191919]">
              {filename}
            </span>
          </div>
          <span className="text-xs text-[#7E7E7E] -mt-3">{fileSize}</span>

          <div className="relative flex justify-center items-center">
            <Image alt="" src={Subtract} />
            <div className="absolute text-[10px] text-center text-[#7E7E7E] font-mono">
              {currentTime} / {totalDuration}
            </div>
          </div>

          <div className="flex items-center gap-2 -mt-3 bg-[#F3F3F3] px-2 rounded-2xl py-0.5 overflow-hidden">
            <button
              onClick={handlePlayPause}
              className={`${startTime ? "h-6 w-6" : "w-8 h-8"}`}
            >
              {isPlaying ? (
                <Image
                  src={PauseIcon}
                  alt="Pause"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={PlayIcon}
                  alt="Play"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
            {/** Wave container for normal (non-special) layout */}
            <div
              ref={containerRef}
              className={`flex-1 cursor-pointer ${startTime ? "h-12" : "h-20"}`}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AudioPlayer;
