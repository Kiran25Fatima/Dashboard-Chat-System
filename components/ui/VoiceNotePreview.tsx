
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Trash2, SendHorizonal } from "lucide-react";

const BARS = 28;

export default function VoiceNotePreview({
  audioBlob,
  duration,
  onDiscard,
  onSend,
}: {
  audioBlob: Blob;
  duration: number;
  onDiscard: () => void;
  onSend?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);

  const bars = useMemo(
    () =>
      Array.from(
        { length: BARS },
        (_, i) => 6 + Math.round(Math.abs(Math.sin(i * 0.7)) * 12)
      ),
    []
  );

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);

    const audio = new Audio(url);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgress(
        audio.duration
          ? audio.currentTime / audio.duration
          : 0
      );
    };

    const handleEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    return () => {
      audio.pause();
      URL.revokeObjectURL(url);
    };
  }, [audioBlob, duration]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    await audio.play();
    setPlaying(true);
  };

  const playedBars = Math.round(progress * BARS);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(
      Math.floor(seconds % 60)
    ).padStart(2, "0")}`;

  const currentTime = progress * audioDuration;

  return (
    <div
      className="
        w-full
        flex items-center gap-3
        px-3 py-2
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* Play / Pause */}
      <button
  onClick={togglePlayback}
    className="
    shrink-0
    w-9 h-9
    rounded-full
    cursor-pointer
    flex items-center justify-center
    bg-white
    
    text-violet-600
    border border-slate-200
    
    shadow-sm hover:shadow
    hover:bg-violet-50
    hover:border-violet-300
    
    
    transition-all duration-200
  "
>
  {playing ? (
    <Pause size={15} />
  ) : (
    <Play size={15} className="ml-0.5" />
  )}
</button>

      {/* Waveform */}
      <div
        className="
        flex-1
        h-10
        px-2
        rounded-xl
        bg-slate-100
        
        flex items-center
        gap-0.5
        overflow-hidden
        transition-colors
        hover:bg-slate-200
        
      "
      >
        {bars.map((height, index) => (
          <div
            key={index}
            className={`
              w-1 rounded-full transition-all duration-200
              ${
                index < playedBars
                  ? "bg-violet-600"
                  : "bg-slate-300 "
              }
            `}
            style={{
              height: `${height}px`,
            }}
          />
        ))}
      </div>

      {/* Time */}
      <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
        {formatTime(currentTime)} /{" "}
        {formatTime(audioDuration)}
      </div>

      {/* Delete */}
      <button
        onClick={onDiscard}
       className="
        w-9 h-9
        rounded-full
        cursor-pointer
        flex items-center justify-center
        text-slate-400
        hover:text-red-500
        hover:bg-red-50
        
        transition-all duration-200
       "
      >
        <Trash2 size={16} />
      </button>

      {/* Send */}
      {onSend && (
       <button
      onClick={onSend}
      className="
      w-10 h-10
      rounded-full
      cursor-pointer
      bg-violet-600
      hover:bg-violet-700
      hover:scale-105
      text-white
      flex items-center justify-center
      shadow-md
      transition-all duration-200
    "
        >
        <SendHorizonal size={16} />
        </button>
      )}
    </div>
  );
}

