import { useEffect, useState } from "react";
import { Check, Copy, Settings, ShieldCheck } from "lucide-react";
import { avatarDataUri } from "../lib/avatar";
import type { UserProfile } from "../lib/profile";
import { BadgeStack } from "./profile-badges";
import { ProfileAvatar } from "./profile-decor";

export interface DeviceIdHeaderProps {
  deviceId: string;
  nickname: string;
  avatar?: string | null;
  profile?: UserProfile;
  language?: "ru" | "en";
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  t: (key: string) => string;
}

export function DeviceIdHeader({
  deviceId,
  nickname,
  avatar,
  profile,
  language = "ru",
  onOpenSettings,
  onOpenProfile,
  t,
}: DeviceIdHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(avatar);

  useEffect(() => {
    setLocalAvatar(avatar);
  }, [avatar]);

  useEffect(() => {
    const handleStorage = () => setLocalAvatar(localStorage.getItem("avatar"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="flex items-center justify-between border-b border-foreground/5 bg-background/30 px-5 py-3 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onOpenProfile}
        className="group flex min-w-0 items-center gap-3 rounded-2xl px-1 py-0.5 text-left transition hover:bg-foreground/[0.04]"
        title={t("myProfile")}
      >
        <div className="relative shrink-0">
          <ProfileAvatar
            src={localAvatar || avatarDataUri(nickname)}
            alt={nickname}
            decoration={profile?.avatarDecoration ?? "none"}
            shape="circle"
            className="h-9 w-9"
            imageClassName="ring-2 ring-foreground/10 transition group-hover:ring-violet-400/40"
          />
          <span className="absolute -bottom-0.5 -right-0.5 z-20 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{nickname}</span>
            <BadgeStack profile={profile} language={language} limit={2} />
          </div>
          <div className="truncate font-mono text-[11px] text-muted-foreground/60">
            {deviceId}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 md:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("keysLocal")}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl border border-foreground/5 bg-foreground/[0.03] px-2.5 py-2 text-xs text-muted-foreground transition hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground"
          title={t("copy")}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{t("copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">{t("copy")}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 rounded-xl border border-foreground/5 bg-foreground/[0.03] px-2.5 py-2 text-xs text-muted-foreground transition hover:border-foreground/10 hover:bg-foreground/[0.06] hover:text-foreground"
          title={t("settings")}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">{t("settings")}</span>
        </button>
      </div>
    </header>
  );
}
