import { useEffect, useState } from "react";
import { Check, Copy, Pencil, ShieldCheck, Sparkles, X } from "lucide-react";
import { BadgeChip } from "./profile-badges";
import { ProfileAvatar, ProfileBannerPattern, ProfileEffectLayer } from "./profile-decor";
import {
  getProfileBanner,
  MAX_PROFILE_BADGES,
  PROFILE_BADGES,
  type UserProfile,
} from "../lib/profile";
import { avatarDataUri } from "../lib/avatar";
import { cn } from "../lib/utils";

interface ProfileShowcaseProps {
  profile: UserProfile;
  deviceId: string;
  language: "ru" | "en";
  t: (key: string) => string;
  isOwn?: boolean;
  online?: boolean;
  className?: string;
  compact?: boolean;
}

export function ProfileShowcase({
  profile,
  deviceId,
  language,
  t,
  isOwn = false,
  online,
  className,
  compact = false,
}: ProfileShowcaseProps) {
  const [copied, setCopied] = useState(false);
  const banner = getProfileBanner(profile.banner);
  const badges = profile.badges
    .map((id) => PROFILE_BADGES.find((badge) => badge.id === id))
    .filter((badge): badge is (typeof PROFILE_BADGES)[number] => Boolean(badge));

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable in some webviews.
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-card/90 shadow-[0_30px_100px_-35px_rgba(0,0,0,0.9)] backdrop-blur-2xl",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "h-24" : "h-28 sm:h-32")}>
        <div className="absolute inset-0" style={{ backgroundImage: banner.gradient }} />
        <ProfileBannerPattern pattern={banner.pattern} />
        <div className="absolute inset-0 grid-overlay opacity-25" />
        <div
          className="absolute -left-10 -top-16 h-44 w-44 rounded-full blur-3xl"
          style={{ backgroundColor: banner.glow }}
        />
        <div className="absolute -right-8 bottom-[-4.5rem] h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
          {isOwn ? <Sparkles className="h-2.5 w-2.5" /> : <ShieldCheck className="h-2.5 w-2.5" />}
          {isOwn ? t("publicProfile") : t("profile")}
        </div>
      </div>

      <ProfileEffectLayer effect={profile.profileEffect} className="z-[1] opacity-90" />

      <div className="relative z-[2] px-4 pb-5 sm:px-5">
        <div className="-mt-10 flex items-end gap-3.5">
          <div className="relative shrink-0">
            <ProfileAvatar
              src={profile.avatar || avatarDataUri(profile.nickname)}
              alt={profile.nickname}
              decoration={profile.avatarDecoration}
              className="h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
            />
            {profile.statusEmoji && (
              <span className="absolute -bottom-1 -right-1 z-20 flex h-7 w-7 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-sm shadow-lg backdrop-blur-md">
                {profile.statusEmoji}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-0.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {profile.nickname || t("profile")}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    online ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-muted-foreground/40",
                  )}
                />
                {online ? t("online") : t("offline")}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {profile.statusText || `@${deviceId.slice(-8)}`}
            </p>
          </div>
        </div>

        <div className="mt-3.5 rounded-2xl border border-foreground/[0.07] bg-foreground/[0.025] px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
            {t("about")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">
            {profile.bio || t("noBio")}
          </p>
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
              {t("badges")}
            </p>
            <span className="text-[10px] text-muted-foreground/50">
              {badges.length}/{MAX_PROFILE_BADGES}
            </span>
          </div>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <BadgeChip key={badge.id} badge={badge} language={language} animated />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">{t("noBadges")}</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] px-3 py-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-300" />
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground/70">
            {deviceId}
          </span>
          <button
            type="button"
            onClick={handleCopyId}
            className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] text-muted-foreground transition hover:bg-foreground/[0.06] hover:text-foreground"
            title={t("copy")}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  deviceId?: string;
  language: "ru" | "en";
  t: (key: string) => string;
  isOwn?: boolean;
  online?: boolean;
  onEdit?: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  deviceId,
  language,
  t,
  isOwn = false,
  online,
  onEdit,
}: ProfileModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition hover:bg-black/50 hover:text-white"
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </button>

        <ProfileShowcase
          profile={profile}
          deviceId={deviceId || "unknown"}
          language={language}
          t={t}
          isOwn={isOwn}
          online={online}
        />

        <div className="mt-3 flex gap-2">
          {isOwn && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Pencil className="h-4 w-4" />
              {t("editProfile")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.05] px-4 py-3 text-sm font-medium text-foreground/90 transition hover:bg-foreground/[0.09]"
            >
              {t("close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
