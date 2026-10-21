"use client";

import { useEffect, useRef } from "react";
import { CheckCheck, LockKeyhole, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarDataUri } from "../lib/avatar";
import { cn } from "@/lib/utils";
import type { Contact } from "./contacts-sidebar";
import { BadgeStack } from "./profile-badges";
import { FileMessage } from "./FileMessage";
import { EncryptedPackage } from "../lib/crypto";

export interface Message {
  id: string;
  senderId: string;
  type: "text" | "file";
  content?: string;
  fileData?: {
    encrypted?: EncryptedPackage;
    metadata: {
      name: string;
      type: string;
      size: number;
      unencrypted?: boolean;
      duration?: number;
    };
    file_url?: string;
  };
  localPreviewUrl?: string;
  time: string;
  date: string;
}

interface ChatAreaProps {
  contact: (Contact & { action?: string }) | null;
  messages: Message[];
  currentUserId: string;
  onDecryptAndDownloadFile: (
    encryptedData: EncryptedPackage,
    metadata: { name: string; type: string; size: number; unencrypted?: boolean },
  ) => Promise<void>;
  onDecryptAndGetFileData: (encryptedData: EncryptedPackage) => Promise<ArrayBuffer>;
  onOpenProfile?: () => void;
  language?: "ru" | "en";
  t: (key: string) => string;
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === message.date) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date: message.date, messages: [message] });
    }
  }
  return groups;
}

function getActionText(action: string, t: (key: string) => string): string {
  switch (action) {
    case "typing":
      return t("typing");
    case "uploading":
      return t("uploadingStatus");
    case "recording":
      return t("recordingStatus");
    default:
      return "";
  }
}

export function ChatArea({
  contact,
  messages,
  currentUserId,
  onDecryptAndDownloadFile,
  onDecryptAndGetFileData,
  onOpenProfile,
  language = "ru",
  t,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, contact?.action]);

  if (!contact) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <div className="mb-2 text-5xl opacity-30">💬</div>
          <p className="text-sm text-muted-foreground">{t("selectChat")}</p>
        </div>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-foreground/5 bg-background/40 px-6 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={onOpenProfile}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left"
          title={contact.profile ? t("profile") : t("viewProfile")}
        >
          <Avatar className="h-11 w-11 ring-2 ring-foreground/10 transition group-hover:ring-violet-400/40">
            <AvatarImage
              src={contact.avatar || avatarDataUri(contact.name)}
              alt={contact.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white">
              {contact.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-foreground transition group-hover:text-violet-700 dark:group-hover:text-violet-200">
                {contact.name}
              </h3>
              <BadgeStack profile={contact.profile} language={language} limit={2} />
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                {contact.online && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-1.5 w-1.5 rounded-full",
                    contact.online ? "bg-emerald-400" : "bg-muted-foreground/40",
                  )}
                />
              </span>
              <span
                className={cn(
                  contact.online ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60",
                )}
              >
                {contact.online ? t("online") : t("offline")}
              </span>
              {contact.profile?.statusText && (
                <>
                  <span className="text-muted-foreground/25">·</span>
                  <span className="min-w-0 truncate text-muted-foreground/60">
                    {contact.profile.statusText}
                  </span>
                </>
              )}
              {contact.action && (
                <span className="animate-fade-in shrink-0 text-violet-600 dark:text-violet-300">{getActionText(contact.action, t)}</span>
              )}
            </div>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 sm:flex">
            <LockKeyhole className="h-3.5 w-3.5" />
            E2EE
          </div>
          <button
            type="button"
            onClick={onOpenProfile}
            className="rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2 text-muted-foreground transition hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground"
            aria-label={t("profile")}
            title={t("profile")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          {grouped.map((group, groupIndex) => (
            <div key={`${group.date}-${groupIndex}`}>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-foreground/5" />
                <span className="rounded-full border border-foreground/5 bg-foreground/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
                  {group.date}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-foreground/10 to-foreground/5" />
              </div>

              <div className="space-y-3">
                {group.messages.map((message, index) => {
                  const isCurrentUser = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex animate-fade-up items-end gap-2",
                        isCurrentUser ? "justify-end" : "justify-start",
                      )}
                      style={{ animationDelay: `${Math.min(index * 25, 220)}ms` }}
                    >
                      {!isCurrentUser && (
                        <Avatar className="mb-1 h-7 w-7 shrink-0 ring-1 ring-foreground/10">
                          <AvatarImage
                            src={contact.avatar || avatarDataUri(contact.name)}
                            alt={contact.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-semibold text-white">
                            {contact.name.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition duration-300 sm:max-w-[70%]",
                          isCurrentUser
                            ? "rounded-tr-md bg-gradient-to-br from-violet-500 via-indigo-500 to-indigo-600 text-white shadow-glow-sm hover:-translate-y-0.5 hover:shadow-glow"
                            : "rounded-tl-md border border-foreground/[0.08] bg-foreground/[0.055] text-foreground/90 backdrop-blur-xl hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-foreground/[0.075]",
                        )}
                      >
                        {message.type === "text" ? (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        ) : (
                          <FileMessage
                            fileName={message.fileData!.metadata.name}
                            fileType={message.fileData!.metadata.type}
                            fileSize={message.fileData!.metadata.size}
                            encryptedData={message.fileData!.encrypted!}
                            onDecryptAndDownload={onDecryptAndDownloadFile}
                            onDecryptAndGetData={onDecryptAndGetFileData}
                            localPreviewUrl={message.localPreviewUrl}
                            metadata={message.fileData!.metadata}
                            isOwn={isCurrentUser}
                            duration={message.fileData!.metadata.duration}
                          />
                        )}

                        <div
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-[10px]",
                            isCurrentUser
                              ? "text-white/65"
                              : "text-muted-foreground/55",
                          )}
                        >
                          <span>{message.time}</span>
                          {isCurrentUser && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {contact.action === "typing" && (
            <div className="flex animate-fade-in items-end gap-2">
              <Avatar className="mb-1 h-7 w-7 shrink-0 ring-1 ring-foreground/10">
                <AvatarImage
                  src={contact.avatar || avatarDataUri(contact.name)}
                  alt={contact.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-semibold text-white">
                  {contact.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-tl-md border border-foreground/[0.08] bg-foreground/[0.055] px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-violet-500 dark:bg-violet-300" />
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-violet-500 dark:bg-violet-300 [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-violet-500 dark:bg-violet-300 [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
