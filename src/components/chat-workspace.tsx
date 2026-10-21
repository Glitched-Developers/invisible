import { useState } from "react";
import { Ghost, MessageSquareLock, Plus, Search, Settings, Sparkles } from "lucide-react";
import { ChatArea } from "./chat-area";
import { ChatBackdrop } from "./chat-backdrop";
import { ContactsSidebar } from "./contacts-sidebar";
import { DeviceIdHeader } from "./device-id-header";
import { MessageInput } from "./message-input";
import { ProfileModal } from "./profile-card";
import { ProfileAvatar } from "./profile-decor";
import { BadgeStack } from "./profile-badges";
import { SettingsModal } from "./SettingsModal";
import { avatarDataUri } from "../lib/avatar";
import { compressImage } from "../lib/image";
import { createDefaultProfile, type UserProfile } from "../lib/profile";
import type { useDemoChat } from "../hooks/useDemoChat";
import type { useMyServerChat } from "../hooks/useMyServerChat";

type ChatController = ReturnType<typeof useMyServerChat> | ReturnType<typeof useDemoChat>;

interface ProfileTarget {
  profile: UserProfile;
  deviceId: string;
  isOwn: boolean;
  online?: boolean;
}

interface ChatWorkspaceProps {
  chat: ChatController;
  onSwitchMode: () => void;
  demo?: boolean;
}

function EmptyChat({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="glass relative max-w-sm overflow-hidden rounded-[2rem] p-8 text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="mx-auto mb-5 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-400/20 text-violet-700 ring-1 ring-foreground/10 dark:text-violet-200">
          <MessageSquareLock className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{t("emptyChatTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("selectChat")}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
          {t("e2eeEnabled")}
        </div>
      </div>
    </div>
  );
}

export function ChatWorkspace({ chat, onSwitchMode, demo = false }: ChatWorkspaceProps) {
  const [profileTarget, setProfileTarget] = useState<ProfileTarget | null>(null);
  const myProfile = chat.myProfile || createDefaultProfile(chat.myNickname, chat.myAvatar);
  const contact = chat.currentContact
    ? { ...chat.currentContact, action: chat.currentAction || undefined }
    : null;
  const openOwnProfile = () => {
    setProfileTarget({
      profile: { ...myProfile, nickname: chat.myNickname, avatar: chat.myAvatar },
      deviceId: chat.myDeviceId || "",
      isOwn: true,
      online: true,
    });
  };
  const openContactProfile = () => {
    if (!contact) return;
    const profile = contact.profile
      ? {
          ...contact.profile,
          nickname: contact.name,
          avatar: contact.avatar || contact.profile.avatar,
        }
      : createDefaultProfile(contact.name, contact.avatar || null);
    setProfileTarget({
      profile,
      deviceId: contact.id,
      isOwn: false,
      online: contact.online,
    });
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
      <ChatBackdrop />
      <aside className="relative z-10 flex w-[22rem] shrink-0 flex-col border-r border-foreground/5 bg-sidebar/70 backdrop-blur-2xl">
        <div className="px-5 pb-3 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/60">
                Invisible
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                {chat.t("chats")}
              </h1>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-glow-sm">
              <Ghost className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2.5 transition focus-within:border-violet-400/40 focus-within:bg-foreground/[0.07] focus-within:shadow-glow-sm">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={chat.contactInput}
              onChange={(event) => chat.setContactInput(event.target.value)}
              placeholder={chat.t("enterDeviceIdPlaceholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              onKeyDown={(event) => {
                if (event.key === "Enter") chat.addContact(chat.contactInput);
              }}
            />
            <button
              type="button"
              onClick={() => chat.addContact(chat.contactInput)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.08] text-muted-foreground transition hover:bg-violet-500/20 hover:text-violet-700 dark:hover:text-violet-200"
              aria-label={chat.t("add")}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2">
          <ContactsSidebar
            contacts={chat.contacts}
            selectedContactId={chat.recipientId}
            onSelectContact={chat.handleSelectContact}
            onDeleteContact={chat.deleteContact}
            onBlockContact={chat.blockContact}
            contactActions={chat.contactActions}
            language={chat.language === "en" ? "en" : "ru"}
            t={chat.t}
          />
        </div>

        <div className="border-t border-foreground/5 p-3">
          <button
            type="button"
            onClick={() => chat.setIsSettingsOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition hover:border-foreground/10 hover:bg-foreground/[0.06]"
          >
            <ProfileAvatar
              src={chat.myAvatar || avatarDataUri(chat.myNickname)}
              alt={chat.myNickname}
              decoration={myProfile.avatarDecoration}
              shape="circle"
              className="h-10 w-10"
              imageClassName="ring-2 ring-foreground/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {chat.myNickname}
                </p>
                <BadgeStack
                  profile={myProfile}
                  language={chat.language === "en" ? "en" : "ru"}
                  limit={2}
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {chat.myDeviceId}
              </p>
            </div>
            <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <DeviceIdHeader
          deviceId={chat.myDeviceId!}
          nickname={chat.myNickname}
          avatar={chat.myAvatar}
          profile={myProfile}
          language={chat.language === "en" ? "en" : "ru"}
          onOpenSettings={() => chat.setIsSettingsOpen(true)}
          onOpenProfile={openOwnProfile}
          t={chat.t}
        />

        {demo && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl border border-violet-400/15 bg-violet-500/10 px-4 py-2 text-xs text-violet-700 dark:text-violet-200/90">
            <Sparkles className="h-3.5 w-3.5" />
            {chat.t("demoBanner")}
          </div>
        )}

        {!chat.recipientId ? (
          <EmptyChat t={chat.t} />
        ) : (
          <>
            <ChatArea
              contact={contact}
              messages={chat.messages}
              currentUserId={chat.myDeviceId!}
              onDecryptAndDownloadFile={chat.downloadDecryptedFile}
              onDecryptAndGetFileData={chat.decryptFileData}
              onOpenProfile={openContactProfile}
              language={chat.language === "en" ? "en" : "ru"}
              t={chat.t}
            />
            <MessageInput
              onSendMessage={chat.sendTextMessage}
              onSendFile={chat.sendFileMessage}
              onTyping={chat.handleTyping}
              disabled={chat.isInputDisabled}
              t={chat.t}
            />
          </>
        )}
      </main>

      <SettingsModal
        isOpen={chat.isSettingsOpen}
        onClose={() => chat.setIsSettingsOpen(false)}
        currentNickname={chat.myNickname}
        onUpdateNickname={chat.updateNickname}
        currentTheme={chat.theme}
        onToggleTheme={() => chat.setTheme(chat.theme === "dark" ? "light" : "dark")}
        onToggleLanguage={chat.toggleLanguage}
        currentLanguage={chat.language}
        onLogout={chat.handleLogout}
        avatar={chat.myAvatar}
        onAvatarChange={chat.updateAvatar}
        blockedList={chat.blockedList}
        onUnblock={chat.unblockContact}
        onSwitchMode={onSwitchMode}
        onExportKeys={chat.handleExportKeys}
        onImportKeys={chat.handleImportKeys}
        t={chat.t}
        compressImage={compressImage}
        deviceId={chat.myDeviceId || undefined}
        demo={demo}
        profile={myProfile}
        onUpdateProfile={chat.updateProfile}
      />

      <ProfileModal
        isOpen={Boolean(profileTarget)}
        onClose={() => setProfileTarget(null)}
        profile={profileTarget?.profile ?? null}
        deviceId={profileTarget?.deviceId}
        language={chat.language === "en" ? "en" : "ru"}
        t={chat.t}
        isOwn={profileTarget?.isOwn}
        online={profileTarget?.online}
        onEdit={
          profileTarget?.isOwn
            ? () => {
                setProfileTarget(null);
                chat.setIsSettingsOpen(true);
              }
            : undefined
        }
      />
    </div>
  );
}
