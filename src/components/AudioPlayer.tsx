import * as React from "react";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import PauseIcon from "../assets/Pause.svg";
import PlayIcon from "../assets/Play.svg";
import backTimer from "@/assets/backTimer.svg";
import forwardTimer from "@/assets/forwardTimer.svg";
import Subtract from "../assets/Subtract.svg";
import { useWavesurfer } from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import { formatTime, parseTimestamp } from "@/utils";

interface AudioPlayerProps {
  audioUrl: string;
  filename: string;
  fileSize: string;
  startTime?: string;
  isFileSpecial?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  filename,
  fileSize,
  startTime,
  isFileSpecial,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [isInitialized, setIsInitialized] = useState(false);

  // Configure WaveSurfer
  const { wavesurfer, isPlaying } = useWavesurfer({
    barWidth: 2,
    cursorWidth: 1,
    cursorColor: "transparent",
    container: containerRef,
    height: isFileSpecial ? 420 : startTime ? 49 : 80,
    waveColor: "#B2B2B2",
    progressColor: "#2C6BF8",
    url: audioUrl,
    plugins: useMemo(() => [Timeline.create()], []),
  });

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
      };

      wavesurfer.on("ready", handleReady);
      wavesurfer.on("timeupdate", updateTime);

      return () => {
        wavesurfer.un("ready", handleReady);
        wavesurfer.un("timeupdate", updateTime);
      };
    }
  }, [wavesurfer, startTime, isInitialized]);

  return (
    <>
      {isFileSpecial ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-full h-[50%] bg-white">
            <div
              ref={containerRef}
              className="relative flex-1 cursor-pointer"
            />
          </div>

          <p className="font-mono text-xs text-primary">
            {currentTime} / {totalDuration}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <button onClick={() => handleSkip(-15)}>
              <Image src={backTimer} alt="Back 15 seconds" />
            </button>
            <button onClick={handlePlayPause}>
              {isPlaying ? (
                <Image src={PauseIcon} alt="Pause" />
              ) : (
                <Image src={PlayIcon} alt="Play" />
              )}
            </button>
            <button onClick={() => handleSkip(15)}>
              <Image src={forwardTimer} alt="Forward 10 seconds" />
            </button>
          </div>
        </div>
      ) : (
        /** STANDARD STYLE BRANCH **/
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
            <button onClick={handlePlayPause} className="">
              {isPlaying ? (
                <Image
                  src={PauseIcon}
                  alt="Pause"
                  className={`${startTime ? "h-6 w-6" : "w-8 h-8"}`}
                />
              ) : (
                <Image
                  src={PlayIcon}
                  alt="Play"
                  className={`${startTime ? "h-6 w-6" : "w-8 h-8"}`}
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
