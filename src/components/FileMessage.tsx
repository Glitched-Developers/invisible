import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  File,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Music,
  X,
} from "lucide-react";
import { base64ToArrayBuffer, EncryptedPackage } from "../lib/crypto";
import { VoicePlayer } from "./voice-message";

interface FileMessageProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  encryptedData: EncryptedPackage;
  onDecryptAndDownload: (encryptedData: EncryptedPackage, metadata: any) => Promise<void>;
  onDecryptAndGetData: (encryptedData: EncryptedPackage) => Promise<ArrayBuffer>;
  localPreviewUrl?: string | null;
  metadata?: any;
  isOwn?: boolean;
  duration?: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function FileMessage({
  fileName,
  fileType,
  fileSize,
  encryptedData,
  onDecryptAndDownload,
  onDecryptAndGetData,
  localPreviewUrl,
  metadata,
  isOwn,
  duration,
}: FileMessageProps) {
  const [downloading, setDownloading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const decryptRef = useRef(onDecryptAndGetData);
  decryptRef.current = onDecryptAndGetData;

  const isImage = fileType.startsWith("image/");
  const isAudio = fileType.startsWith("audio/") || /\.(webm|mp3|m4a|ogg|wav|opus)$/i.test(fileName);
  const previewUrl = localPreviewUrl || null;

  useEffect(() => {
    if (!isAudio) return;

    let cancelled = false;
    setAudioError(null);
    setAudioLoading(true);

    const clearBlob = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    if (localPreviewUrl) {
      setAudioUrl(localPreviewUrl);
      setAudioLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const unencrypted = metadata?.unencrypted ?? encryptedData.unencrypted;

    if (unencrypted) {
      try {
        const ciphertext = encryptedData.ciphertext;
        if (!ciphertext || (typeof ciphertext === "string" && !ciphertext.length)) {
          throw new Error("Empty audio data");
        }
        const buffer =
          typeof ciphertext === "string"
            ? base64ToArrayBuffer(ciphertext)
            : new Uint8Array(ciphertext).buffer;
        const url = URL.createObjectURL(new Blob([buffer], { type: fileType }));
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        clearBlob();
        blobUrlRef.current = url;
        setAudioUrl(url);
        setAudioLoading(false);
      } catch (error) {
        console.error("Could not read audio", error);
        if (!cancelled) {
          setAudioError("Could not read audio");
          setAudioLoading(false);
        }
      }
    } else {
      decryptRef
        .current(encryptedData)
        .then((buffer) => {
          if (cancelled) return;
          if (!buffer || buffer.byteLength === 0) throw new Error("Empty buffer");
          const url = URL.createObjectURL(new Blob([buffer], { type: fileType }));
          clearBlob();
          blobUrlRef.current = url;
          setAudioUrl(url);
        })
        .catch((error) => {
          console.error("Audio decryption failed", error);
          if (!cancelled) setAudioError("Audio decryption failed");
        })
        .finally(() => {
          if (!cancelled) setAudioLoading(false);
        });
    }

    return () => {
      cancelled = true;
      clearBlob();
    };
  }, [
    isAudio,
    localPreviewUrl,
    encryptedData,
    fileType,
    metadata?.unencrypted,
  ]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      if (localPreviewUrl) {
        const anchor = document.createElement("a");
        anchor.href = localPreviewUrl;
        anchor.download = fileName;
        anchor.click();
      } else {
        await onDecryptAndDownload(encryptedData, metadata);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  }, [encryptedData, fileName, localPreviewUrl, metadata, onDecryptAndDownload]);

  const getFileIcon = () => {
    const iconClass = "h-8 w-8";
    if (isImage) return <ImageIcon className={iconClass} />;
    if (fileType.startsWith("video/")) return <Film className={iconClass} />;
    if (isAudio) return <Music className={iconClass} />;
    if (fileType.includes("pdf") || fileType.includes("document")) {
      return <FileText className={iconClass} />;
    }
    return <File className={iconClass} />;
  };

  if (isImage && previewUrl) {
    return (
      <>
        <div className="flex max-w-sm flex-col gap-2">
          <img
            src={previewUrl}
            alt={fileName}
            className="max-h-64 max-w-full cursor-pointer rounded-lg border border-white/10 object-contain transition hover:opacity-90"
            onClick={() => setIsZoomed(true)}
          />
          <div
            className={`flex items-center justify-between text-xs ${
              isOwn ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            <span className="truncate">
              {fileName} ({formatSize(fileSize)})
            </span>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-full p-1 transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        {isZoomed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setIsZoomed(false)}
          >
            <button className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewUrl}
              alt={fileName}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        )}
      </>
    );
  }

  if (isAudio) {
    if (audioUrl) {
      return (
        <VoicePlayer
          src={audioUrl}
          fileName={fileName}
          fileSize={fileSize}
          isOwn={isOwn}
          downloading={downloading}
          onDownload={handleDownload}
          fallbackDuration={duration ?? metadata?.duration}
        />
      );
    }

    return (
      <div
        className={`flex w-[15.5rem] max-w-full items-center gap-2.5 rounded-xl px-2 py-2 sm:w-[17rem] ${
          isOwn ? "bg-white/12" : "bg-foreground/[0.04]"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isOwn ? "bg-white/20 text-white" : "bg-violet-500/15 text-violet-500"
          }`}
        >
          {audioLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Music className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-6 items-center gap-[2px]">
            {Array.from({ length: 28 }).map((_, index) => (
              <span
                key={index}
                className={`w-[2px] animate-pulse rounded-full ${
                  isOwn ? "bg-white/35" : "bg-foreground/20"
                }`}
                style={{
                  height: `${20 + ((index * 37) % 60)}%`,
                  animationDelay: `${index * 40}ms`,
                }}
              />
            ))}
          </div>
          <p
            className={`mt-0.5 truncate text-[10px] ${
              isOwn ? "text-white/70" : "text-muted-foreground/70"
            }`}
          >
            {audioError || `${formatSize(fileSize)} · voice message`}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`shrink-0 rounded-md p-1 transition ${
            isOwn ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex max-w-sm items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-sm">
      {getFileIcon()}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
        <p className="text-xs text-muted-foreground">{formatSize(fileSize)}</p>
        {audioError && <p className="text-xs text-red-500">{audioError}</p>}
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-full p-1 transition-colors hover:bg-accent"
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4 text-foreground" />
        )}
      </button>
    </div>
  );
}
