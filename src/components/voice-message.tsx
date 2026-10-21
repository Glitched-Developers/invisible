import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Pause, Play } from "lucide-react";
import { cn } from "../lib/utils";

interface VoicePlayerProps {
  src: string;
  fileName: string;
  fileSize: number;
  isOwn?: boolean;
  downloading?: boolean;
  onDownload: () => void;
  fallbackDuration?: number;
}

function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function VoicePlayer({
  src,
  fileName,
  fileSize,
  isOwn,
  downloading,
  onDownload,
  fallbackDuration,
}: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration || 0);
  const [rate, setRate] = useState(1);
  const [failed, setFailed] = useState(false);

  const bars = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < fileName.length; i += 1) {
      hash = (hash * 31 + fileName.charCodeAt(i)) >>> 0;
    }
    return Array.from({ length: 38 }, (_, index) => {
      const value = (hash + index * 73 + (index % 5) * 41) % 100;
      return 24 + (value % 76);
    });
  }, [fileName]);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(fallbackDuration || 0);
    setFailed(false);

    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleTime = () => setCurrent(audio.currentTime);
    const handleEnded = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const handleError = () => setFailed(true);

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("durationchange", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("durationchange", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [src, fallbackDuration]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      audio.playbackRate = rate;
      await audio.play();
      setPlaying(true);
    } catch (error) {
      console.error("Voice playback failed", error);
      setFailed(true);
    }
  }, [failed, playing, rate]);

  const seek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      audio.currentTime = ratio * duration;
      setCurrent(audio.currentTime);
    },
    [duration],
  );

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  return (
    <div
      className={cn(
        "flex w-[15.5rem] max-w-full items-center gap-2.5 rounded-xl px-2 py-1.5 sm:w-[17rem]",
        isOwn ? "bg-white/12" : "bg-foreground/[0.04]",
      )}
    >
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:scale-105",
          isOwn
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow-sm",
        )}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
      >
        {failed ? (
          <span className="text-[10px] font-bold">!</span>
        ) : playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className="flex h-6 cursor-pointer items-center gap-[2px]"
          onClick={seek}
          role="slider"
          aria-label="Voice message progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          tabIndex={0}
          onKeyDown={(event) => {
            const audio = audioRef.current;
            if (!audio || !duration) return;
            if (event.key === "ArrowRight") {
              audio.currentTime = Math.min(duration, audio.currentTime + 5);
            } else if (event.key === "ArrowLeft") {
              audio.currentTime = Math.max(0, audio.currentTime - 5);
            }
          }}
        >
          {bars.map((height, index) => {
            const filled = index / bars.length <= progress;
            return (
              <span
                key={index}
                className={cn(
                  "w-[2px] shrink-0 rounded-full transition-all duration-150",
                  filled
                    ? isOwn
                      ? "bg-white"
                      : "bg-gradient-to-t from-violet-500 to-cyan-400"
                    : isOwn
                      ? "bg-white/35"
                      : "bg-foreground/20",
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1.5 text-[10px] tabular-nums",
            isOwn ? "text-white/70" : "text-muted-foreground/70",
          )}
        >
          <span>{formatTime(current || duration)}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-current opacity-50" />
          <span>{formatSize(fileSize)}</span>
          <span className="sr-only">{fileName}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setRate((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
        }}
        className={cn(
          "shrink-0 rounded-md px-1 py-0.5 text-[10px] font-semibold tabular-nums transition",
          isOwn
            ? "text-white/75 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
        aria-label="Playback speed"
      >
        {rate}×
      </button>

      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className={cn(
          "shrink-0 rounded-md p-1 transition",
          isOwn
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
        aria-label="Download voice message"
      >
        {downloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
