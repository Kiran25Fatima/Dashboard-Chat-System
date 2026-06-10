"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const BARS = 30;

export default function VoiceMessageBubble({
  src,
  duration,
  isMe,
}: {
  src: string;
  duration: number;
  isMe: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);

  const bars = useMemo(
    () => Array.from({ length: BARS }, (_, i) => 4 + Math.round(Math.abs(Math.sin(i * 0.7 + 1)) * 18)),
    []
  );

  useEffect(() => {
    const a = new Audio(src);
    audioRef.current = a;

    a.addEventListener("loadedmetadata", () => setAudioDuration(a.duration || duration));
    a.addEventListener("timeupdate", () => setProgress(a.duration ? a.currentTime / a.duration : 0));
    a.addEventListener("ended", () => { setPlaying(false); setProgress(0); });
    a.addEventListener("pause", () => setPlaying(false));

    return () => { a.pause(); };
  }, [src]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play(); setPlaying(true); }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const playedCount = Math.round(progress * BARS);

  const playedColor = isMe ? "rgba(255,255,255,0.9)" : "#7c3aed";
  const unplayedColor = isMe ? "rgba(255,255,255,0.3)" : "rgba(124,58,237,0.2)";
  const timeColor = isMe ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.35)";

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={{ background: isMe ? "rgba(255,255,255,0.2)" : "#7c3aed" }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing
          ? <Pause size={13} color={isMe ? "#fff" : "#fff"} />
          : <Play size={13} color={isMe ? "#fff" : "#fff"} fill={isMe ? "#fff" : "#fff"} />
        }
      </button>

      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex items-center gap-0.5 h-6">
          {bars.map((h, i) => (
            <div
              key={i}
              className="rounded-sm shrink-0"
              style={{
                width: "3px",
                height: `${h}px`,
                background: i < playedCount ? playedColor : unplayedColor,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-[11px] tabular-nums" style={{ color: timeColor }}>
            {playing ? fmt(progress * audioDuration) : "0:00"}
          </span>
          <span className="text-[11px] tabular-nums" style={{ color: timeColor }}>
            {fmt(audioDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}