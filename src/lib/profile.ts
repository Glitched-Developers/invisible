import {
  Crown,
  Flame,
  FlaskConical,
  Gem,
  Ghost,
  KeyRound,
  LockKeyhole,
  MoonStar,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type BadgeRarity = "common" | "exclusive";

export type ProfileBadgeId =
  | "early"
  | "night"
  | "crypto"
  | "beta"
  | "verified"
  | "founder"
  | "first100"
  | "ghost"
  | "legend"
  | "ambassador";

export type BadgeEffect =
  | "sparkle"
  | "twinkle"
  | "scan"
  | "bubble"
  | "pulse"
  | "crown"
  | "rainbow"
  | "float"
  | "flame"
  | "aurora";

export interface ProfileBadgeDefinition {
  id: ProfileBadgeId;
  rarity: BadgeRarity;
  icon: LucideIcon;
  label: { ru: string; en: string };
  description: { ru: string; en: string };
  gradient: string;
  effect: BadgeEffect;
}

export type ProfileBannerId = "nebula" | "aurora" | "sunset" | "royal" | "ice" | "void";
export type ProfileBannerPattern = "stars" | "waves" | "sun" | "stripes" | "crystal" | "void";

export interface ProfileBannerDefinition {
  id: ProfileBannerId;
  label: { ru: string; en: string };
  gradient: string;
  glow: string;
  pattern: ProfileBannerPattern;
}

export type ProfileEffectId = "none" | "aurora" | "sparkles" | "scan" | "embers" | "holo";

export interface ProfileEffectDefinition {
  id: ProfileEffectId;
  label: { ru: string; en: string };
  description: { ru: string; en: string };
  tone: string;
}

export type AvatarDecorationId = "none" | "neon" | "gold" | "holo" | "flame" | "orbit" | "frost";

export interface AvatarDecorationDefinition {
  id: AvatarDecorationId;
  label: { ru: string; en: string };
  description: { ru: string; en: string };
  ringClass: string;
  glow: string;
}

export interface UserProfile {
  nickname: string;
  avatar: string | null;
  bio: string;
  statusEmoji: string;
  statusText: string;
  banner: ProfileBannerId;
  profileEffect: ProfileEffectId;
  avatarDecoration: AvatarDecorationId;
  badges: ProfileBadgeId[];
}

export const MAX_PROFILE_BADGES = 3;
export const MAX_BIO_LENGTH = 120;
export const MAX_STATUS_LENGTH = 32;

export const PROFILE_BADGES: ProfileBadgeDefinition[] = [
  {
    id: "early",
    rarity: "common",
    icon: Sparkles,
    label: { ru: "Ранний доступ", en: "Early access" },
    description: { ru: "Один из первых, кто заглянул в Invisible.", en: "One of the first to step into Invisible." },
    gradient: "from-violet-500 via-indigo-500 to-cyan-400",
    effect: "sparkle",
  },
  {
    id: "night",
    rarity: "common",
    icon: MoonStar,
    label: { ru: "Полуночник", en: "Night owl" },
    description: { ru: "Лучшие разговоры случаются после полуночи.", en: "The best conversations happen after midnight." },
    gradient: "from-indigo-500 via-purple-600 to-slate-900",
    effect: "twinkle",
  },
  {
    id: "crypto",
    rarity: "common",
    icon: LockKeyhole,
    label: { ru: "Крипто-энтузиаст", en: "Crypto nerd" },
    description: { ru: "Шифрование — это не опция, а привычка.", en: "Encryption isn't an option, it's a habit." },
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    effect: "scan",
  },
  {
    id: "beta",
    rarity: "common",
    icon: FlaskConical,
    label: { ru: "Бета-тестер", en: "Beta tester" },
    description: { ru: "Помогает делать Invisible лучше до релиза.", en: "Helps make Invisible better before release." },
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    effect: "bubble",
  },
  {
    id: "verified",
    rarity: "common",
    icon: ShieldCheck,
    label: { ru: "Проверенный", en: "Verified" },
    description: { ru: "Личность и устройство подтверждены.", en: "Identity and device verified." },
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    effect: "pulse",
  },
  {
    id: "founder",
    rarity: "exclusive",
    icon: Crown,
    label: { ru: "Основатель", en: "Founder" },
    description: { ru: "Стоял у истоков Invisible.", en: "Was there when Invisible began." },
    gradient: "from-amber-300 via-yellow-400 to-orange-500",
    effect: "crown",
  },
  {
    id: "first100",
    rarity: "exclusive",
    icon: KeyRound,
    label: { ru: "Первые 100", en: "First 100" },
    description: { ru: "Вошёл в первую сотню пользователей.", en: "Joined the first hundred users." },
    gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
    effect: "rainbow",
  },
  {
    id: "ghost",
    rarity: "exclusive",
    icon: Ghost,
    label: { ru: "Призрак", en: "Ghost" },
    description: { ru: "Виден только тем, кому действительно нужно.", en: "Seen only by those who truly need to." },
    gradient: "from-violet-600 via-fuchsia-500 to-cyan-400",
    effect: "float",
  },
  {
    id: "legend",
    rarity: "exclusive",
    icon: Flame,
    label: { ru: "Легенда", en: "Legend" },
    description: { ru: "Оставил след в истории Invisible.", en: "Left a mark on Invisible history." },
    gradient: "from-orange-500 via-red-500 to-fuchsia-600",
    effect: "flame",
  },
  {
    id: "ambassador",
    rarity: "exclusive",
    icon: Gem,
    label: { ru: "Посол", en: "Ambassador" },
    description: { ru: "Помогает Invisible становиться ближе к людям.", en: "Helps bring Invisible closer to people." },
    gradient: "from-cyan-300 via-sky-500 to-violet-600",
    effect: "aurora",
  },
];

export const PROFILE_BANNERS: ProfileBannerDefinition[] = [
  {
    id: "nebula",
    label: { ru: "Небула", en: "Nebula" },
    gradient:
      "linear-gradient(120deg, rgba(124,58,237,0.95) 0%, rgba(79,70,229,0.82) 42%, rgba(34,211,238,0.62) 100%)",
    glow: "rgba(139,92,246,0.58)",
    pattern: "stars",
  },
  {
    id: "aurora",
    label: { ru: "Аврора", en: "Aurora" },
    gradient:
      "linear-gradient(120deg, rgba(16,185,129,0.86) 0%, rgba(6,182,212,0.78) 46%, rgba(59,130,246,0.7) 100%)",
    glow: "rgba(34,211,238,0.52)",
    pattern: "waves",
  },
  {
    id: "sunset",
    label: { ru: "Закат", en: "Sunset" },
    gradient:
      "linear-gradient(120deg, rgba(244,63,94,0.9) 0%, rgba(249,115,22,0.82) 48%, rgba(251,191,36,0.7) 100%)",
    glow: "rgba(251,113,133,0.52)",
    pattern: "sun",
  },
  {
    id: "royal",
    label: { ru: "Роял", en: "Royal" },
    gradient:
      "linear-gradient(120deg, rgba(67,56,202,0.95) 0%, rgba(147,51,234,0.78) 48%, rgba(236,72,153,0.64) 100%)",
    glow: "rgba(168,85,247,0.58)",
    pattern: "stripes",
  },
  {
    id: "ice",
    label: { ru: "Лёд", en: "Ice" },
    gradient:
      "linear-gradient(120deg, rgba(14,165,233,0.82) 0%, rgba(56,189,248,0.7) 45%, rgba(148,163,184,0.6) 100%)",
    glow: "rgba(56,189,248,0.52)",
    pattern: "crystal",
  },
  {
    id: "void",
    label: { ru: "Бездна", en: "Void" },
    gradient:
      "linear-gradient(120deg, rgba(15,23,42,0.98) 0%, rgba(30,27,75,0.95) 48%, rgba(88,28,135,0.82) 100%)",
    glow: "rgba(99,102,241,0.5)",
    pattern: "void",
  },
];

export const PROFILE_EFFECTS: ProfileEffectDefinition[] = [
  {
    id: "none",
    label: { ru: "Без эффекта", en: "No effect" },
    description: { ru: "Чистый и спокойный профиль.", en: "A clean and calm profile." },
    tone: "rgba(148,163,184,0.35)",
  },
  {
    id: "aurora",
    label: { ru: "Сияние", en: "Aurora" },
    description: { ru: "Медленные волны света по карточке.", en: "Slow waves of light across the card." },
    tone: "rgba(34,211,238,0.55)",
  },
  {
    id: "sparkles",
    label: { ru: "Звёздная пыль", en: "Stardust" },
    description: { ru: "Мерцающие частицы вокруг профиля.", en: "Twinkling particles around the profile." },
    tone: "rgba(196,181,253,0.6)",
  },
  {
    id: "scan",
    label: { ru: "Скан-линии", en: "Scanlines" },
    description: { ru: "Технологичный след и мягкое свечение.", en: "A techy trail and soft glow." },
    tone: "rgba(52,211,153,0.5)",
  },
  {
    id: "embers",
    label: { ru: "Пепел", en: "Embers" },
    description: { ru: "Тлеющие искры, поднимающиеся вверх.", en: "Glowing sparks drifting upward." },
    tone: "rgba(251,146,60,0.55)",
  },
  {
    id: "holo",
    label: { ru: "Голограмма", en: "Hologram" },
    description: { ru: "Радужный блик по поверхности карточки.", en: "A rainbow sheen across the card." },
    tone: "rgba(244,114,182,0.5)",
  },
];

export const AVATAR_DECORATIONS: AvatarDecorationDefinition[] = [
  {
    id: "none",
    label: { ru: "Без ободка", en: "No frame" },
    description: { ru: "Обычная рамка аватара.", en: "A regular avatar frame." },
    ringClass: "",
    glow: "transparent",
  },
  {
    id: "neon",
    label: { ru: "Неон", en: "Neon" },
    description: { ru: "Фиолетово-бирюзовое свечение.", en: "Violet-cyan neon glow." },
    ringClass: "avatar-deco-neon",
    glow: "rgba(139,92,246,0.65)",
  },
  {
    id: "gold",
    label: { ru: "Золото", en: "Gold" },
    description: { ru: "Тёплый металл и мягкий блик.", en: "Warm metal with a soft shine." },
    ringClass: "avatar-deco-gold",
    glow: "rgba(251,191,36,0.65)",
  },
  {
    id: "holo",
    label: { ru: "Голограмма", en: "Holo" },
    description: { ru: "Радужный переливающийся ободок.", en: "An iridescent rainbow frame." },
    ringClass: "avatar-deco-holo",
    glow: "rgba(236,72,153,0.6)",
  },
  {
    id: "flame",
    label: { ru: "Пламя", en: "Flame" },
    description: { ru: "Огненный контур с пульсацией.", en: "A pulsing fiery outline." },
    ringClass: "avatar-deco-flame",
    glow: "rgba(249,115,22,0.65)",
  },
  {
    id: "orbit",
    label: { ru: "Орбита", en: "Orbit" },
    description: { ru: "Тонкое кольцо с вращающейся точкой.", en: "A slim ring with a rotating dot." },
    ringClass: "avatar-deco-orbit",
    glow: "rgba(34,211,238,0.6)",
  },
  {
    id: "frost",
    label: { ru: "Иней", en: "Frost" },
    description: { ru: "Ледяная кромка и холодное свечение.", en: "An icy edge with a cold glow." },
    ringClass: "avatar-deco-frost",
    glow: "rgba(125,211,252,0.6)",
  },
];

const BADGE_MAP = new Map(PROFILE_BADGES.map((badge) => [badge.id, badge]));
const BANNER_MAP = new Map(PROFILE_BANNERS.map((banner) => [banner.id, banner]));
const EFFECT_MAP = new Map(PROFILE_EFFECTS.map((effect) => [effect.id, effect]));
const DECORATION_MAP = new Map(AVATAR_DECORATIONS.map((decoration) => [decoration.id, decoration]));
const STORAGE_PREFIX = "invisible-profile:";

export function getBadge(id: ProfileBadgeId): ProfileBadgeDefinition | undefined {
  return BADGE_MAP.get(id);
}

export function getProfileBanner(id: ProfileBannerId): ProfileBannerDefinition {
  return BANNER_MAP.get(id) || PROFILE_BANNERS[0];
}

export function getProfileEffect(id: ProfileEffectId): ProfileEffectDefinition {
  return EFFECT_MAP.get(id) || PROFILE_EFFECTS[0];
}

export function getAvatarDecoration(id: AvatarDecorationId): AvatarDecorationDefinition {
  return DECORATION_MAP.get(id) || AVATAR_DECORATIONS[0];
}

export function createDefaultProfile(
  nickname: string,
  avatar: string | null,
  overrides: Partial<Omit<UserProfile, "nickname" | "avatar">> = {},
): UserProfile {
  return {
    nickname,
    avatar,
    bio: "",
    statusEmoji: "🌙",
    statusText: "",
    banner: "nebula",
    profileEffect: "none",
    avatarDecoration: "none",
    badges: ["early"],
    ...overrides,
  };
}

export function normalizeProfile(input: Partial<UserProfile> | null | undefined, fallback: UserProfile): UserProfile {
  if (!input) return fallback;

  const legacyAccent = (input as Partial<UserProfile> & { accent?: ProfileBannerId }).accent;
  const rawBanner = input.banner ?? legacyAccent;
  const banner = rawBanner && BANNER_MAP.has(rawBanner) ? rawBanner : fallback.banner;
  const profileEffect =
    input.profileEffect && EFFECT_MAP.has(input.profileEffect) ? input.profileEffect : fallback.profileEffect;
  const avatarDecoration =
    input.avatarDecoration && DECORATION_MAP.has(input.avatarDecoration)
      ? input.avatarDecoration
      : fallback.avatarDecoration;
  const badges = Array.isArray(input.badges)
    ? input.badges.filter((id): id is ProfileBadgeId => BADGE_MAP.has(id as ProfileBadgeId)).slice(0, MAX_PROFILE_BADGES)
    : fallback.badges;

  return {
    nickname: typeof input.nickname === "string" && input.nickname.trim() ? input.nickname.trim() : fallback.nickname,
    avatar: typeof input.avatar === "string" ? input.avatar : input.avatar === null ? null : fallback.avatar,
    bio: typeof input.bio === "string" ? input.bio.slice(0, MAX_BIO_LENGTH) : fallback.bio,
    statusEmoji: typeof input.statusEmoji === "string" ? input.statusEmoji.slice(0, 4) : fallback.statusEmoji,
    statusText:
      typeof input.statusText === "string" ? input.statusText.slice(0, MAX_STATUS_LENGTH) : fallback.statusText,
    banner,
    profileEffect,
    avatarDecoration,
    badges,
  };
}

function profileStorageKey(deviceId: string): string {
  return `${STORAGE_PREFIX}${deviceId}`;
}

export function loadProfile(deviceId: string, fallback: UserProfile): UserProfile {
  try {
    const stored = localStorage.getItem(profileStorageKey(deviceId));
    if (!stored) return fallback;
    return normalizeProfile(JSON.parse(stored) as Partial<UserProfile>, fallback);
  } catch {
    return fallback;
  }
}

export function saveProfile(deviceId: string, profile: UserProfile): void {
  try {
    localStorage.setItem(profileStorageKey(deviceId), JSON.stringify(profile));
  } catch {
    // Local storage can be unavailable in restricted webviews. The in-memory profile still works.
  }
}

export function toggleProfileBadge(profile: UserProfile, badgeId: ProfileBadgeId): UserProfile {
  if (profile.badges.includes(badgeId)) {
    return { ...profile, badges: profile.badges.filter((id) => id !== badgeId) };
  }
  if (profile.badges.length >= MAX_PROFILE_BADGES) return profile;
  return { ...profile, badges: [...profile.badges, badgeId] };
}

export function getProfileBadgeGroups(profile: UserProfile): {
  common: ProfileBadgeDefinition[];
  exclusive: ProfileBadgeDefinition[];
} {
  const selected = profile.badges
    .map((id) => getBadge(id))
    .filter((badge): badge is ProfileBadgeDefinition => Boolean(badge));

  return {
    common: selected.filter((badge) => badge.rarity === "common"),
    exclusive: selected.filter((badge) => badge.rarity === "exclusive"),
  };
}
