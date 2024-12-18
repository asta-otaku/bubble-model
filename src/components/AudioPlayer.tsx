import * as React from "react";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import PauseIcon from "../assets/Pause.svg";
import PlayIcon from "../assets/Play.svg";
import Subtract from "../assets/Subtract.svg";
import { useWavesurfer } from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";

interface AudioPlayerProps {
  audioUrl: string;
  filename: string;
  fileSize: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  filename,
  fileSize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalDuration, setTotalDuration] = useState("00:00");

  const { wavesurfer, isPlaying } = useWavesurfer({
    barWidth: 2,
    cursorWidth: 1,
    cursorColor: "transparent",
    container: containerRef,
    height: 80,
    waveColor: "#B2B2B2",
    progressColor: "#2C6BF8",
    url: audioUrl,
    plugins: useMemo(() => [Timeline.create()], []),
  });

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  }, [wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      const updateTime = () => {
        const current = wavesurfer.getCurrentTime();
        setCurrentTime(formatTime(current));
      };

      const updateDuration = () => {
        const duration = wavesurfer.getDuration();
        setTotalDuration(formatTime(duration));
      };

      // Set initial duration when loaded
      wavesurfer.on("ready", updateDuration);
      // Update current time during playback
      wavesurfer.on("timeupdate", updateTime);

      return () => {
        wavesurfer.un("ready", updateDuration);
        wavesurfer.un("timeupdate", updateTime);
      };
    }
  }, [wavesurfer]);

  return (
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
            <Image src={PauseIcon} alt="Pause" className="w-8 h-8" />
          ) : (
            <Image src={PlayIcon} alt="Play" className="w-8 h-8" />
          )}
        </button>
        <div ref={containerRef} className="flex-1 cursor-pointer h-20" />
      </div>
    </div>
  );
};

export default AudioPlayer;
