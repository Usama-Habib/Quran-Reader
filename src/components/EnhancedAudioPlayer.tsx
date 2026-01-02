"use client";

import React, { useRef, useEffect, useState } from "react";

interface EnhancedAudioPlayerProps {
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
  isPlaying?: boolean;
  onPlayPause?: (playing: boolean) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({
  src,
  onEnded,
  autoPlay,
  showControls = false,
  isPlaying = false,
  onPlayPause,
  volume = 1,
  onVolumeChange,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(autoPlay || false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (autoPlay) {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  }, [src, autoPlay, volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setPlaying(isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
        onPlayPause?.(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
        onPlayPause?.(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    onVolumeChange?.(vol);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!showControls) {
    return (
      <audio
        ref={audioRef}
        src={src}
        onEnded={onEnded}
        style={{ display: "none" }}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    );
  }

  return (
    <div className="bg-[#f9f7f3] border-2 border-[#e2c275] rounded-lg p-3 shadow-lg">
      <audio
        ref={audioRef}
        src={src}
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ display: "none" }}
      />
      
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[#bfa76a] hover:bg-[#e2c275] text-white flex items-center justify-center transition"
        >
          {playing ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l10 6-10 6V4z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-[#7c6f57] font-mono min-w-[35px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #bfa76a 0%, #bfa76a ${
                (currentTime / duration) * 100
              }%, #e2c275 ${(currentTime / duration) * 100}%, #e2c275 100%)`,
            }}
          />
          <span className="text-xs text-[#7c6f57] font-mono min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#7c6f57]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 3.5v13l-4-4H2v-5h4l4-4zm5.5 6.5c0-1.5-.8-2.8-2-3.5v7c1.2-.7 2-2 2-3.5zm0-6.5v2c2.2.9 3.5 3 3.5 5.5s-1.3 4.6-3.5 5.5v2c3.2-1 5.5-4 5.5-7.5S18.7 5 15.5 3.5z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #bfa76a 0%, #bfa76a ${
                volume * 100
              }%, #e2c275 ${volume * 100}%, #e2c275 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedAudioPlayer;
