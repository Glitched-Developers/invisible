import { useEffect, useState } from "react";
import {
    Camera,
    Check,
    CheckCircle2,
    ChevronRight,
    Copy,
    Download,
    Eye,
    FileUp,
    Fingerprint,
    KeyRound,
    Languages,
    Lock,
    LogOut,
    Moon,
    Palette,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Sun,
    Upload,
    User,
    UserCheck,
    UserX,
    X,
} from "lucide-react";
import { MyServerApi as ApiClient } from "../lib/apiClient";
import { avatarDataUri } from "../lib/avatar";
import {
    AVATAR_DECORATIONS,
    MAX_BIO_LENGTH,
    MAX_PROFILE_BADGES,
    MAX_STATUS_LENGTH,
    PROFILE_BANNERS,
    PROFILE_BADGES,
    PROFILE_EFFECTS,
    toggleProfileBadge,
    type ProfileBadgeId,
    type UserProfile,
} from "../lib/profile";
import { ProfileShowcase } from "./profile-card";
import { BadgeGlyph } from "./profile-badges";
import { ProfileAvatar } from "./profile-decor";
import { cn } from "../lib/utils";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentNickname: string;
    onUpdateNickname: (newNickname: string) => void;
    currentTheme?: string;
    onToggleTheme: () => void;
    onToggleLanguage: () => void;
    currentLanguage: string;
    onLogout: () => void;
    avatar: string | null;
    onAvatarChange: (avatar: string) => void;
    blockedList: string[];
    onUnblock: (userId: string) => Promise<void>;
    onSwitchMode: () => void;
    onExportKeys?: (password: string) => void;
    onImportKeys?: (file: File, password: string) => void;
    t: (key: string) => string;
    compressImage: (file: File) => Promise<string>;
    deviceId?: string;
    demo?: boolean;
    profile: UserProfile;
    onUpdateProfile: (patch: Partial<Omit<UserProfile, "nickname" | "avatar">>) => void;
}

type SettingsTab = "profile" | "appearance" | "privacy" | "keys";

export function SettingsModal({
    isOpen,
    onClose,
    currentNickname,
    onUpdateNickname,
    currentTheme,
    onToggleTheme,
    onToggleLanguage,
    currentLanguage,
    onLogout,
    avatar,
    onAvatarChange,
    blockedList,
    onUnblock,
    onSwitchMode,
    onExportKeys,
    onImportKeys,
    t,
    compressImage,
    deviceId,
    demo = false,
    profile,
    onUpdateProfile,
}: SettingsModalProps) {
    const [nickname, setNickname] = useState(currentNickname);
    const [shouldRender, setShouldRender] = useState(false);
    const [localAvatar, setLocalAvatar] = useState(avatar);
    const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
    const [blockedDetails, setBlockedDetails] = useState<{ id: string; name: string }[]>([]);
    const [tab, setTab] = useState<SettingsTab>("profile");
    const [saved, setSaved] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [badgeLimitHit, setBadgeLimitHit] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    const [passwordPrompt, setPasswordPrompt] = useState<
        | { type: "export"; action: (password: string) => void }
        | { type: "import"; file: File; action: (password: string) => void }
        | null
    >(null);
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setTab("profile");
            setNickname(currentNickname);
            setLocalAvatar(avatar);
            setDraftProfile({
                ...profile,
                nickname: currentNickname,
                avatar,
            });
        } else {
            const timer = setTimeout(() => setShouldRender(false), 220);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!blockedList.length) {
            setBlockedDetails([]);
            return;
        }
        if (demo) {
            setBlockedDetails(blockedList.map((id) => ({ id, name: `User ${id.slice(-4)}` })));
            return;
        }
        const fetchBlockedDetails = async () => {
            const details = await Promise.all(
                blockedList.map(async (id) => {
                    try {
                        const { nickname: blockedNickname } = await ApiClient.getNickname(id);
                        return { id, name: blockedNickname };
                    } catch {
                        return { id, name: `User ${id.slice(-4)}` };
                    }
                }),
            );
            setBlockedDetails(details);
        };
        fetchBlockedDetails();
    }, [blockedList, demo]);

    if (!shouldRender) return null;

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large, max 2MB");
                return;
            }
            try {
                const compressed = await compressImage(file);
                setLocalAvatar(compressed);
                setDraftProfile((prev) => ({ ...prev, avatar: compressed }));
                onAvatarChange(compressed);
            } catch (error) {
                console.error(error);
                alert("Failed to compress image");
            }
        }
        if (event.target) event.target.value = "";
    };

    const handleSaveNickname = () => {
        if (nickname.trim() && nickname.trim() !== currentNickname) {
            setDraftProfile((prev) => ({ ...prev, nickname: nickname.trim() }));
            onUpdateNickname(nickname.trim());
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSaveProfile = () => {
        const trimmedNickname = nickname.trim();
        if (trimmedNickname && trimmedNickname !== currentNickname) {
            onUpdateNickname(trimmedNickname);
        }
        onUpdateProfile({
            bio: draftProfile.bio.trim(),
            statusEmoji: draftProfile.statusEmoji,
            statusText: draftProfile.statusText.trim(),
            banner: draftProfile.banner,
            profileEffect: draftProfile.profileEffect,
            avatarDecoration: draftProfile.avatarDecoration,
            badges: draftProfile.badges,
        });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2200);
    };

    const handleToggleBadge = (badgeId: ProfileBadgeId) => {
        const isSelected = draftProfile.badges.includes(badgeId);
        if (!isSelected && draftProfile.badges.length >= MAX_PROFILE_BADGES) {
            setBadgeLimitHit(true);
            setTimeout(() => setBadgeLimitHit(false), 2200);
            return;
        }
        setBadgeLimitHit(false);
        setDraftProfile((prev) => toggleProfileBadge(prev, badgeId));
    };

    const handleUnblock = async (userId: string) => {
        await onUnblock(userId);
        setBlockedDetails((prev) => prev.filter((blocked) => blocked.id !== userId));
    };

    const handleCopyDeviceId = async () => {
        if (!deviceId) return;
        await navigator.clipboard.writeText(deviceId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleExportKeysClick = () => {
        if (onExportKeys) setPasswordPrompt({ type: "export", action: onExportKeys });
    };

    const handleImportKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onImportKeys) {
            setPasswordPrompt({
                type: "import",
                file,
                action: (value) => onImportKeys(file, value),
            });
        }
        if (event.target) event.target.value = "";
    };

    const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
        { id: "profile", label: t("profile"), icon: User },
        { id: "appearance", label: t("appearance"), icon: Palette },
        { id: "privacy", label: t("privacy"), icon: ShieldCheck },
        { id: "keys", label: t("keys"), icon: KeyRound },
    ];

    const activeTheme = currentTheme === "light" ? "light" : "dark";

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-3 transition-all duration-200 sm:p-6",
                isOpen ? "bg-black/65 opacity-100 backdrop-blur-md" : "bg-black/0 opacity-0",
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    "relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-border bg-card/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] transition-all duration-300 no-scrollbar",
                    isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0",
                )}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative h-28 overflow-hidden bg-gradient-to-r from-violet-600/45 via-indigo-500/30 to-cyan-400/20">
                    <div className="absolute inset-0 grid-overlay opacity-40" />
                    <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-violet-400/25 blur-3xl" />
                    <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-xl border border-white/15 bg-black/30 p-2 text-white/80 backdrop-blur-md transition hover:bg-black/45 hover:text-white"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="-mt-10 px-5 pb-6 sm:px-8">
                    <div className="flex items-end gap-4">
                        <div className="relative shrink-0">
                            <img
                                src={localAvatar || avatarDataUri(currentNickname)}
                                alt={currentNickname}
                                className="h-20 w-20 rounded-3xl object-cover ring-4 ring-card"
                            />
                            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-muted text-violet-700 dark:text-violet-200 shadow-lg transition hover:bg-violet-500/20">
                                <Camera className="h-4 w-4" />
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="min-w-0 pb-1">
                            <h2 className="truncate text-lg font-semibold text-foreground">
                                {currentNickname}
                            </h2>
                            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/60">
                                {deviceId || t("deviceId")}
                            </p>
                        </div>
                        <div className="ml-auto hidden items-center gap-1.5 rounded-full border border-emerald-500/20 dark:border-emerald-400/20 bg-emerald-500/10 dark:bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 sm:flex">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            E2EE
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-[176px_1fr]">
                        <nav className="flex gap-1 overflow-x-auto pb-1 no-scrollbar sm:flex-col sm:pb-0">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setTab(id)}
                                    className={cn(
                                        "flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition",
                                        tab === id
                                            ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/5 text-foreground ring-1 ring-violet-400/20"
                                            : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                    <ChevronRight
                                        className={cn(
                                            "ml-auto hidden h-3.5 w-3.5 sm:block",
                                            tab === id ? "opacity-70" : "opacity-0",
                                        )}
                                    />
                                </button>
                            ))}
                        </nav>

                        <div className="min-h-[330px]">
                            {tab === "profile" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {t("profilePreview")}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {t("profilePreviewHint")}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    "hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium sm:inline-flex",
                                                    demo
                                                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                                                        : "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300",
                                                )}
                                            >
                                                {demo ? <Eye className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                                                {demo ? t("profileVisibility") : t("profileLocalOnly")}
                                            </span>
                                        </div>
                                        <ProfileShowcase
                                            profile={{
                                                ...draftProfile,
                                                nickname: nickname.trim() || draftProfile.nickname,
                                                avatar: localAvatar,
                                            }}
                                            deviceId={deviceId || "invisible-demo"}
                                            language={currentLanguage === "en" ? "en" : "ru"}
                                            t={t}
                                            isOwn
                                            online
                                        />
                                    </div>

                                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <ProfileAvatar
                                                    src={localAvatar || avatarDataUri(nickname || currentNickname)}
                                                    alt={nickname || currentNickname}
                                                    decoration={draftProfile.avatarDecoration}
                                                    className="h-14 w-14"
                                                    imageClassName="rounded-2xl ring-2 ring-foreground/10"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {t("avatar")}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {t("avatarHint")}
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground/90 transition hover:bg-foreground/10">
                                                <Upload className="h-3.5 w-3.5" />
                                                {t("uploadAvatar")}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                        <label className="text-sm font-semibold text-foreground">
                                            {t("nickname")}
                                        </label>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t("nicknameHint")}
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <input
                                                type="text"
                                                value={nickname}
                                                onChange={(event) => {
                                                    setNickname(event.target.value);
                                                    setDraftProfile((prev) => ({
                                                        ...prev,
                                                        nickname: event.target.value,
                                                    }));
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter") handleSaveNickname();
                                                }}
                                                className="min-w-0 flex-1 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-violet-400/40 focus:bg-black/30 focus:shadow-glow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveNickname}
                                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
                                            >
                                                {saved ? <Check className="h-4 w-4" /> : null}
                                                {saved ? t("saved") : t("save")}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {t("status")}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t("statusHint")}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {["🌙", "👻", "⚡", "🎧", "🔥", "💜", "🧊", "✨"].map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() =>
                                                            setDraftProfile((prev) => ({
                                                                ...prev,
                                                                statusEmoji: emoji,
                                                            }))
                                                        }
                                                        className={cn(
                                                            "flex h-9 w-9 items-center justify-center rounded-xl border text-base transition",
                                                            draftProfile.statusEmoji === emoji
                                                                ? "border-violet-400/50 bg-violet-500/15 shadow-glow-sm"
                                                                : "border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.06]",
                                                        )}
                                                        aria-label={`${t("statusEmoji")}: ${emoji}`}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5 transition focus-within:border-violet-400/40 focus-within:shadow-glow-sm">
                                                <span className="text-lg leading-none">{draftProfile.statusEmoji}</span>
                                                <input
                                                    type="text"
                                                    value={draftProfile.statusText}
                                                    onChange={(event) =>
                                                        setDraftProfile((prev) => ({
                                                            ...prev,
                                                            statusText: event.target.value,
                                                        }))
                                                    }
                                                    maxLength={MAX_STATUS_LENGTH}
                                                    placeholder={t("statusPlaceholder")}
                                                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                                                />
                                                <span className="shrink-0 text-[10px] text-muted-foreground/50">
                                                    {draftProfile.statusText.length}/{MAX_STATUS_LENGTH}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-border/60 pt-4">
                                            <label className="text-sm font-semibold text-foreground">
                                                {t("bio")}
                                            </label>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t("bioHint")}
                                            </p>
                                            <textarea
                                                rows={3}
                                                value={draftProfile.bio}
                                                onChange={(event) =>
                                                    setDraftProfile((prev) => ({
                                                        ...prev,
                                                        bio: event.target.value,
                                                    }))
                                                }
                                                maxLength={MAX_BIO_LENGTH}
                                                placeholder={t("bioPlaceholder")}
                                                className="mt-3 w-full resize-none rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-violet-400/40 focus:bg-black/30 focus:shadow-glow-sm"
                                            />
                                            <div className="mt-1 text-right text-[10px] text-muted-foreground/50">
                                                {draftProfile.bio.length}/{MAX_BIO_LENGTH}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {t("profileCustomization")}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {t("profileCustomizationHint")}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:text-violet-200">
                                                {t("livePreview")}
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                                                {t("banner")}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                                                {t("bannerHint")}
                                            </p>
                                            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                                {PROFILE_BANNERS.map((banner) => {
                                                    const selected = draftProfile.banner === banner.id;
                                                    return (
                                                        <button
                                                            key={banner.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setDraftProfile((prev) => ({
                                                                    ...prev,
                                                                    banner: banner.id,
                                                                }))
                                                            }
                                                            className={cn(
                                                                "group rounded-xl border p-1.5 text-left transition",
                                                                selected
                                                                    ? "border-violet-400/50 bg-violet-500/10 shadow-glow-sm"
                                                                    : "border-border/60 bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.05]",
                                                            )}
                                                            title={banner.label[currentLanguage === "en" ? "en" : "ru"]}
                                                        >
                                                            <span
                                                                className="block h-8 overflow-hidden rounded-md shadow-inner"
                                                                style={{ backgroundImage: banner.gradient }}
                                                            />
                                                            <span className="mt-1 flex items-center justify-between gap-1 px-0.5 text-[9px] font-medium text-muted-foreground">
                                                                <span className="truncate">
                                                                    {banner.label[currentLanguage === "en" ? "en" : "ru"]}
                                                                </span>
                                                                {selected && (
                                                                    <Check className="h-2.5 w-2.5 shrink-0 text-violet-500 dark:text-violet-300" />
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-border/60 pt-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                                                {t("profileEffect")}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                                                {t("profileEffectHint")}
                                            </p>
                                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {PROFILE_EFFECTS.map((effect) => {
                                                    const selected = draftProfile.profileEffect === effect.id;
                                                    return (
                                                        <button
                                                            key={effect.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setDraftProfile((prev) => ({
                                                                    ...prev,
                                                                    profileEffect: effect.id,
                                                                }))
                                                            }
                                                            className={cn(
                                                                "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition",
                                                                selected
                                                                    ? "border-violet-400/50 bg-violet-500/10 shadow-glow-sm"
                                                                    : "border-border/60 bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.05]",
                                                            )}
                                                            title={effect.description[currentLanguage === "en" ? "en" : "ru"]}
                                                        >
                                                            <span
                                                                className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10"
                                                                style={{
                                                                    background: `radial-gradient(circle at 30% 30%, ${effect.tone}, rgba(15,23,42,0.85))`,
                                                                }}
                                                            >
                                                                <Sparkles className="h-3 w-3 text-white/85" />
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block truncate text-[11px] font-medium text-foreground">
                                                                    {effect.label[currentLanguage === "en" ? "en" : "ru"]}
                                                                </span>
                                                                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground/60">
                                                                    {effect.description[currentLanguage === "en" ? "en" : "ru"]}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-border/60 pt-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                                                {t("avatarDecoration")}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                                                {t("avatarDecorationHint")}
                                            </p>
                                            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                                                {AVATAR_DECORATIONS.map((decoration) => {
                                                    const selected = draftProfile.avatarDecoration === decoration.id;
                                                    return (
                                                        <button
                                                            key={decoration.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setDraftProfile((prev) => ({
                                                                    ...prev,
                                                                    avatarDecoration: decoration.id,
                                                                }))
                                                            }
                                                            className={cn(
                                                                "flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2 transition",
                                                                selected
                                                                    ? "border-violet-400/50 bg-violet-500/10 shadow-glow-sm"
                                                                    : "border-border/60 bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.05]",
                                                            )}
                                                            title={
                                                                decoration.description[
                                                                    currentLanguage === "en" ? "en" : "ru"
                                                                ]
                                                            }
                                                        >
                                                            <ProfileAvatar
                                                                src={localAvatar || avatarDataUri(nickname || currentNickname)}
                                                                alt={decoration.label[currentLanguage === "en" ? "en" : "ru"]}
                                                                decoration={decoration.id}
                                                                className="h-9 w-9"
                                                                imageClassName="rounded-[1rem] ring-2"
                                                            />
                                                            <span className="w-full truncate text-center text-[8px] leading-tight font-medium text-muted-foreground">
                                                                {decoration.label[currentLanguage === "en" ? "en" : "ru"]}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {t("badges")}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {t("badgesHint")}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                                                    badgeLimitHit
                                                        ? "border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300"
                                                        : "border-border/60 bg-foreground/[0.03] text-muted-foreground",
                                                )}
                                            >
                                                {draftProfile.badges.length}/{MAX_PROFILE_BADGES}
                                            </span>
                                        </div>
                                        {badgeLimitHit && (
                                            <p className="mt-2 animate-fade-in text-xs text-amber-600 dark:text-amber-300">
                                                {t("badgeLimit")}
                                            </p>
                                        )}

                                        {(["common", "exclusive"] as const).map((rarity) => (
                                            <div key={rarity} className="mt-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    {rarity === "exclusive" && (
                                                        <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
                                                    )}
                                                    <p
                                                        className={cn(
                                                            "text-[10px] font-semibold uppercase tracking-[0.18em]",
                                                            rarity === "exclusive"
                                                                ? "text-amber-700 dark:text-amber-300"
                                                                : "text-muted-foreground/60",
                                                        )}
                                                    >
                                                        {t(rarity === "common" ? "commonBadges" : "exclusiveBadges")}
                                                    </p>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {PROFILE_BADGES.filter((badge) => badge.rarity === rarity).map((badge) => {
                                                        const selected = draftProfile.badges.includes(badge.id);
                                                        return (
                                                            <button
                                                                key={badge.id}
                                                                type="button"
                                                                onClick={() => handleToggleBadge(badge.id)}
                                                                className={cn(
                                                                    "flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition",
                                                                    selected
                                                                        ? "border-violet-400/45 bg-violet-500/10 shadow-glow-sm"
                                                                        : rarity === "exclusive"
                                                                          ? "border-amber-400/20 bg-amber-400/[0.035] hover:border-amber-400/35 hover:bg-amber-400/[0.07]"
                                                                          : "border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.05]",
                                                                )}
                                                            >
                                                                <BadgeGlyph badge={badge} size="md" />
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block text-xs font-semibold text-foreground">
                                                                        {badge.label[currentLanguage === "en" ? "en" : "ru"]}
                                                                    </span>
                                                                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground/70">
                                                                        {badge.description[currentLanguage === "en" ? "en" : "ru"]}
                                                                    </span>
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                                                                        selected
                                                                            ? "border-violet-400/40 bg-violet-500 text-white"
                                                                            : "border-foreground/15 text-transparent",
                                                                    )}
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-4 flex flex-col-reverse items-stretch gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
                                            {profileSaved && (
                                                <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {t("profileSaved")}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleSaveProfile}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
                                            >
                                                {profileSaved ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                                {profileSaved ? t("saved") : t("saveProfile")}
                                            </button>
                                        </div>
                                    </div>

                                    {deviceId && (
                                        <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {t("deviceId")}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                                                        {deviceId}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyDeviceId}
                                                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-foreground/5 px-3 py-2 text-xs text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                                                >
                                                    {copiedId ? (
                                                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                    {copiedId ? t("copied") : t("copy")}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
                                        <ShieldCheck className="h-4 w-4 shrink-0" />
                                        {t("e2eeEnabled")}
                                    </div>
                                </div>
                            )}

                            {tab === "appearance" && (
                                <div className="space-y-5 animate-fade-in">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {t("theme")}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t("themeHint")}
                                        </p>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {[
                                                { id: "dark", label: t("darkMode"), icon: Moon },
                                                { id: "light", label: t("lightMode"), icon: Sun },
                                            ].map(({ id, label, icon: Icon }) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (activeTheme !== id) onToggleTheme();
                                                    }}
                                                    className={cn(
                                                        "rounded-2xl border p-3 text-left transition",
                                                        activeTheme === id
                                                            ? "border-violet-400/40 bg-violet-500/10 shadow-glow-sm"
                                                            : "border-border/70 bg-foreground/[0.03] hover:bg-foreground/[0.06]",
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "mb-3 h-20 rounded-xl border border-border p-2",
                                                            id === "dark"
                                                                ? "bg-[#080b14]"
                                                                : "bg-[#eef1f8]",
                                                        )}
                                                    >
                                                        <div className="mb-1.5 h-2 w-10 rounded-full bg-violet-400/70" />
                                                        <div className="space-y-1.5">
                                                            <div className="h-1.5 w-3/4 rounded-full bg-white/20" />
                                                            <div className="h-1.5 w-1/2 rounded-full bg-white/15" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                            <Icon className="h-3.5 w-3.5" />
                                                            {label}
                                                        </span>
                                                        {activeTheme === id && (
                                                            <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {t("language")}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t("languageHint")}
                                        </p>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            {[
                                                { id: "ru", label: "Русский" },
                                                { id: "en", label: "English" },
                                            ].map(({ id, label }) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (currentLanguage !== id) onToggleLanguage();
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                                                        currentLanguage === id
                                                            ? "border-violet-400/40 bg-violet-500/10 text-foreground shadow-glow-sm"
                                                            : "border-border/70 bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Languages className="h-4 w-4" />
                                                        {label}
                                                    </span>
                                                    {currentLanguage === id && (
                                                        <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === "privacy" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="rounded-2xl border border-border/70 bg-foreground/[0.03] p-4">
                                        <div className="flex items-center gap-2">
                                            <UserX className="h-4 w-4 text-red-600 dark:text-red-300" />
                                            <p className="text-sm font-semibold text-foreground">
                                                {t("blockedUsers")}
                                            </p>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t("privacyHint")}
                                        </p>

                                        {blockedDetails.length === 0 ? (
                                            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border px-4 py-7 text-center">
                                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/5 text-xl">
                                                    🛡️
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {t("noBlockedUsers")}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                                                {blockedDetails.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-foreground/[0.03] p-2.5"
                                                    >
                                                        <img
                                                            src={avatarDataUri(user.name)}
                                                            alt={user.name}
                                                            className="h-9 w-9 rounded-full"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm text-foreground">
                                                                {user.name}
                                                            </p>
                                                            <p className="truncate font-mono text-[10px] text-muted-foreground/50">
                                                                {user.id}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnblock(user.id)}
                                                            className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/20 dark:border-emerald-400/20 bg-emerald-500/10 dark:bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-400/20"
                                                        >
                                                            <UserCheck className="h-3.5 w-3.5" />
                                                            {t("unblock")}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                                        <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
                                        <div>
                                            <p className="text-xs font-medium text-cyan-700 dark:text-cyan-200">
                                                {t("e2eeEnabled")}
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                {t("keysHint")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === "keys" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4">
                                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                                        <div>
                                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                                                {t("backupKeys")}
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-amber-800/70 dark:text-amber-100/60">
                                                {t("keyWarning")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={handleExportKeysClick}
                                            className="group rounded-2xl border border-border/70 bg-foreground/[0.03] p-4 text-left transition hover:border-violet-400/30 hover:bg-violet-500/5"
                                        >
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-200 ring-1 ring-violet-400/20">
                                                <Download className="h-4.5 w-4.5" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {t("exportKeys")}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t("localOnly")}
                                            </p>
                                        </button>

                                        <label className="group cursor-pointer rounded-2xl border border-border/70 bg-foreground/[0.03] p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5">
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-700 dark:text-cyan-200 ring-1 ring-cyan-400/20">
                                                <FileUp className="h-4.5 w-4.5" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {t("importKeys")}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t("backupFileHint")}
                                            </p>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleImportKeysChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300">
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-200">
                                                {t("keysHint")}
                                            </p>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {t("e2eeEnabled")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row">
                        <button
                            type="button"
                            onClick={onSwitchMode}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-foreground/[0.04] px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-foreground/[0.08] hover:text-foreground"
                        >
                            <RefreshCw className="h-4 w-4" />
                            {t("switchMode")}
                        </button>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300 transition hover:bg-red-500/20"
                        >
                            <LogOut className="h-4 w-4" />
                            {t("logout")}
                        </button>
                    </div>
                </div>
            </div>

            {passwordPrompt && (
                <div
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-6 shadow-2xl animate-scale-in">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-700 dark:text-violet-200 ring-1 ring-violet-400/20">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            {passwordPrompt.type === "export"
                                ? t("enterExportPassword")
                                : t("enterImportPassword")}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {t("keyWarning")}
                        </p>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="mt-4 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-violet-400/40 focus:shadow-glow-sm"
                            placeholder={t("password")}
                            autoFocus
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setPasswordPrompt(null);
                                    setPassword("");
                                }}
                                className="rounded-xl border border-border bg-foreground/5 px-4 py-2 text-sm text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!password) return;
                                    passwordPrompt.action(password);
                                    setPasswordPrompt(null);
                                    setPassword("");
                                }}
                                className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:shadow-glow"
                            >
                                {t("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
