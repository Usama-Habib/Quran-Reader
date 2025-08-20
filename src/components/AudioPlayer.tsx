import React, { useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onEnded, autoPlay }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play();
    }
  }, [src, autoPlay]);

  return (
    <audio
      ref={audioRef}
      src={src}
      onEnded={onEnded}
      style={{ display: "none" }}
      autoPlay={autoPlay}
    />
  );
};

export default AudioPlayer;