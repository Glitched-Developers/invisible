import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Mic,
  Paperclip,
  Pause,
  Play,
  Send,
  Square,
  Trash2,
} from "lucide-react";
import { cn } from "../lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendFile: (file: File, options?: { duration?: number }) => Promise<void>;
  onTyping?: (text: string) => void;
  disabled?: boolean;
  t: (key: string) => string;
}

interface PendingVoice {
  file: File;
  url: string;
  duration: number;
}

const PREVIEW_BARS = [28, 52, 36, 74, 44, 62, 30, 84, 48, 66, 38, 58, 26, 72, 42, 60, 34, 50, 30, 64];
const RECORDING_BARS = [36, 62, 48, 78, 40, 70, 52, 88, 46, 60, 34, 74, 44, 82, 38, 58, 30, 68];

function formatDuration(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/wav",
  ];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return "";
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export function MessageInput({
  onSendMessage,
  onSendFile,
  onTyping,
  disabled,
  t,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingVoice, setPendingVoice] = useState<PendingVoice | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const isSendingRef = useRef(false);
  const recordingStartedAtRef = useRef<number>(0);
  const pendingUrlRef = useRef<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [message]);

  useEffect(() => {
    if (!pendingVoice) {
      previewAudioRef.current = null;
      setPreviewPlaying(false);
      return;
    }

    const audio = new Audio(pendingVoice.url);
    previewAudioRef.current = audio;
    const handleEnded = () => setPreviewPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      if (previewAudioRef.current === audio) previewAudioRef.current = null;
    };
  }, [pendingVoice]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }

      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
    };
  }, []);

  const clearPendingVoice = useCallback(() => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setPreviewPlaying(false);
    setPendingVoice(null);
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
  }, []);

  const handleTyping = useCallback(
    (value: string) => {
      setMessage(value);
      if (!onTyping) return;

      const now = Date.now();
      if (now - lastTypingSentRef.current > 1000) {
        if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
        onTyping(value);
        lastTypingSentRef.current = now;
      } else {
        if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = setTimeout(() => {
          onTyping(value);
          lastTypingSentRef.current = Date.now();
        }, 1000 - (now - lastTypingSentRef.current));
      }

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {}, 3000);
    },
    [onTyping],
  );

  const handleFile = useCallback(
    async (file: File, options?: { duration?: number }): Promise<boolean> => {
      if (disabled || isSendingRef.current) return false;
      isSendingRef.current = true;
      setUploading(true);
      try {
        await onSendFile(file, options);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setUploading(false);
        isSendingRef.current = false;
      }
    },
    [disabled, onSendFile],
  );

  const canAttach = !disabled && !isRecording && !pendingVoice;

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      if (!canAttach) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            handleFile(file);
            break;
          }
        }
      }
    },
    [canAttach, handleFile],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!canAttach) return;
      event.preventDefault();
      setIsDragOver(true);
    },
    [canAttach],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      if (!canAttach) return;
      event.preventDefault();
      setIsDragOver(false);
      const files = event.dataTransfer?.files;
      if (files && files.length) handleFile(files[0]);
    },
    [canAttach, handleFile],
  );

  const releaseMedia = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording || pendingVoice) return;
    if (
      typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      alert(t("microphoneUnsupported") || "Microphone is not available here");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 128000 } : undefined,
      );

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onerror = (event) => {
        console.error("Voice recording failed", event);
        releaseMedia();
        setIsRecording(false);
        setRecordingTime(0);
        if (onTyping) onTyping("");
        alert(t("microphoneError") || "Could not access microphone");
      };

      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        const elapsedSeconds = Math.max(
          0,
          (Date.now() - recordingStartedAtRef.current) / 1000,
        );
        const duration = Math.max(1, Math.round(elapsedSeconds));
        releaseMedia();
        setIsRecording(false);
        setRecordingTime(0);
        if (onTyping) onTyping("");

        if (!chunks.length) return;
        if (elapsedSeconds < 0.8) {
          alert(t("recordingTooShort") || "Recording is too short");
          return;
        }

        const blobType =
          recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(chunks, { type: blobType });
        const extension = extensionFor(blobType);
        const file = new File([audioBlob], `voice_${Date.now()}.${extension}`, {
          type: blobType,
        });
        const url = URL.createObjectURL(audioBlob);

        if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
        pendingUrlRef.current = url;
        setPendingVoice({ file, url, duration });
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      if (onTyping) onTyping("recording");

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= 300) {
            const active = mediaRecorderRef.current;
            if (active && active.state !== "inactive") active.stop();
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied", error);
      releaseMedia();
      if (onTyping) onTyping("");
      alert(t("microphoneError") || "Could not access microphone");
    }
  }, [
    disabled,
    isRecording,
    pendingVoice,
    onTyping,
    releaseMedia,
    t,
  ]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    releaseMedia();
    setIsRecording(false);
    setRecordingTime(0);
    if (onTyping) onTyping("");
  }, [onTyping, releaseMedia]);

  const togglePreview = useCallback(async () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPreviewPlaying(true);
    } catch (error) {
      console.error("Voice preview failed", error);
    }
  }, [previewPlaying]);

  const sendPendingVoice = useCallback(async () => {
    if (!pendingVoice || disabled || uploading) return;
    previewAudioRef.current?.pause();
    setPreviewPlaying(false);
    const sent = await handleFile(pendingVoice.file, {
      duration: pendingVoice.duration,
    });
    if (sent) clearPendingVoice();
  }, [clearPendingVoice, disabled, handleFile, pendingVoice, uploading]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    if (message.trim() && !uploading && !isRecording) {
      onSendMessage(message.trim());
      setMessage("");
      if (onTyping) onTyping("");
    }
  }, [disabled, message, uploading, isRecording, onSendMessage, onTyping]);

  const isBusy = uploading || isRecording || Boolean(pendingVoice) || disabled;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-t border-foreground/5 bg-background/40 px-4 py-3 backdrop-blur-xl transition sm:px-6",
        isDragOver && "bg-violet-500/5 ring-1 ring-inset ring-violet-400/30",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(event) => {
            if (event.target.files?.[0]) handleFile(event.target.files[0]);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          disabled={isBusy}
          className="hidden"
          id="file-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-foreground/5 bg-foreground/[0.03] text-muted-foreground transition hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Attach file"
        >
          {uploading && !pendingVoice ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>

        {isRecording ? (
          <div className="flex min-h-[44px] flex-1 items-center gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-red-700 dark:text-red-200">
              {formatDuration(recordingTime)}
            </span>
            <div className="flex h-5 flex-1 items-center gap-[3px] overflow-hidden">
              {RECORDING_BARS.map((height, index) => (
                <span
                  key={index}
                  className="voice-rec-bar w-[3px] shrink-0 rounded-full bg-red-400/80"
                  style={{
                    height: `${Math.max(18, height * 0.42)}%`,
                    animationDelay: `${index * 60}ms`,
                    animationDuration: `${760 + (index % 4) * 120}ms`,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={cancelRecording}
              className="shrink-0 rounded-lg p-1.5 text-red-600/80 transition hover:bg-red-500/15 hover:text-red-500 dark:text-red-200/80 dark:hover:text-red-100"
              aria-label={t("deleteRecording")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : pendingVoice ? (
          <div className="flex min-h-[44px] flex-1 items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-3 py-2">
            <button
              type="button"
              onClick={togglePreview}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow-sm transition hover:scale-105"
              aria-label={previewPlaying ? "Pause" : "Play"}
            >
              {previewPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>
            <div className="flex h-7 flex-1 items-center gap-[2px] overflow-hidden">
              {PREVIEW_BARS.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "w-[3px] shrink-0 rounded-full transition-colors",
                    previewPlaying
                      ? "bg-gradient-to-t from-violet-500 to-cyan-400"
                      : "bg-violet-400/55",
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-violet-700 dark:text-violet-200">
              {formatDuration(pendingVoice.duration)}
            </span>
            <button
              type="button"
              onClick={clearPendingVoice}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-foreground/[0.06] hover:text-foreground"
              aria-label={t("deleteRecording")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => handleTyping(event.target.value)}
            onPaste={handlePaste}
            placeholder={
              uploading
                ? t("uploadingFile")
                : t("typeMessage") || "Сообщение..."
            }
            disabled={disabled || uploading}
            rows={1}
            className="max-h-[132px] min-h-[44px] flex-1 resize-none rounded-2xl border border-foreground/[0.08] bg-foreground/[0.04] px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-violet-400/40 focus:bg-foreground/[0.06] focus:shadow-glow-sm disabled:opacity-50"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />
        )}

        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white shadow-[0_0_24px_-6px_rgba(239,68,68,0.8)] transition hover:bg-red-400"
            aria-label="Stop recording"
          >
            <Square className="h-4 w-4 fill-white" />
          </button>
        ) : pendingVoice ? (
          <button
            type="button"
            onClick={sendPendingVoice}
            disabled={disabled || uploading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("sendVoice")}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        ) : message.trim() ? (
          <button
            type="submit"
            disabled={disabled || uploading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("send")}
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || uploading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-foreground/5 bg-foreground/[0.03] text-muted-foreground transition hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Record voice message"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </form>
    </div>
  );
}
