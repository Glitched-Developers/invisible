import {
  PROFILE_BADGES,
  type BadgeEffect,
  type ProfileBadgeDefinition,
  type UserProfile,
} from "../lib/profile";
import { cn } from "../lib/utils";

const PROFILE_BADGE_CACHE = new Map(PROFILE_BADGES.map((badge) => [badge.id, badge]));

function BadgeEffectArt({ effect }: { effect: BadgeEffect }) {
  switch (effect) {
    case "sparkle":
      return (
        <>
          <span className="bfx bfx-star bfx-star-a" />
          <span className="bfx bfx-star bfx-star-b" />
          <span className="bfx bfx-star bfx-star-c" />
        </>
      );
    case "twinkle":
      return <span className="bfx bfx-twinkle" />;
    case "scan":
      return (
        <>
          <span className="bfx bfx-scanline" />
          <span className="bfx bfx-scan-glow" />
        </>
      );
    case "bubble":
      return (
        <>
          <span className="bfx bfx-bubble bfx-bubble-a" />
          <span className="bfx bfx-bubble bfx-bubble-b" />
          <span className="bfx bfx-bubble bfx-bubble-c" />
        </>
      );
    case "pulse":
      return (
        <>
          <span className="bfx bfx-ring bfx-ring-a" />
          <span className="bfx bfx-ring bfx-ring-b" />
        </>
      );
    case "crown":
      return <span className="bfx bfx-crown" />;
    case "rainbow":
      return <span className="bfx bfx-rainbow" />;
    case "float":
      return <span className="bfx bfx-float-glow" />;
    case "flame":
      return (
        <>
          <span className="bfx bfx-flame" />
          <span className="bfx bfx-spark bfx-spark-a" />
          <span className="bfx bfx-spark bfx-spark-b" />
        </>
      );
    case "aurora":
      return <span className="bfx bfx-aurora" />;
    default:
      return null;
  }
}

interface BadgeGlyphProps {
  badge: ProfileBadgeDefinition;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  title?: string;
  /** Force-enable/disable the animated effect. Defaults to on for md/lg. */
  animated?: boolean;
}

const GLYPH_SIZE: Record<NonNullable<BadgeGlyphProps["size"]>, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

const ICON_SIZE: Record<NonNullable<BadgeGlyphProps["size"]>, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function BadgeGlyph({ badge, size = "sm", className, title, animated }: BadgeGlyphProps) {
  const Icon = badge.icon;
  const isExclusive = badge.rarity === "exclusive";
  const showEffect = animated ?? (size === "md" || size === "lg");

  return (
    <span
      title={title}
      className={cn(
        "badge-glyph inline-flex shrink-0 items-center justify-center",
        GLYPH_SIZE[size],
        showEffect && `badge-fx-${badge.effect}`,
        isExclusive && showEffect && "badge-glyph-exclusive",
        className,
      )}
    >
      <span
        className={cn(
          "badge-glyph-core bg-gradient-to-br text-white shadow-sm",
          badge.gradient,
          isExclusive && "ring-1 ring-amber-200/80 badge-exclusive",
        )}
      />
      {showEffect && (
        <span className="badge-fx" aria-hidden="true">
          <BadgeEffectArt effect={badge.effect} />
        </span>
      )}
      <Icon className={cn(ICON_SIZE[size], "relative z-[2]")} strokeWidth={2.2} />
    </span>
  );
}

interface BadgeChipProps {
  badge: ProfileBadgeDefinition;
  language: "ru" | "en";
  className?: string;
  selected?: boolean;
  animated?: boolean;
}

export function BadgeChip({ badge, language, className, selected, animated }: BadgeChipProps) {
  const isExclusive = badge.rarity === "exclusive";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
        isExclusive
          ? "border-amber-400/30 bg-gradient-to-r from-amber-400/15 via-yellow-300/10 to-orange-400/10 text-amber-700 dark:text-amber-200"
          : "border-foreground/10 bg-foreground/[0.04] text-foreground/80",
        selected && "ring-1 ring-violet-400/40",
        className,
      )}
      title={badge.description[language]}
    >
      <BadgeGlyph badge={badge} size={animated ? "md" : "xs"} animated={animated} />
      <span className="whitespace-nowrap">{badge.label[language]}</span>
    </span>
  );
}

interface BadgeStackProps {
  profile?: Pick<UserProfile, "badges"> | null;
  language: "ru" | "en";
  limit?: number;
  size?: "xs" | "sm";
  className?: string;
}

export function BadgeStack({ profile, language, limit = 2, size = "xs", className }: BadgeStackProps) {
  if (!profile?.badges?.length) return null;

  if (limit <= 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {profile.badges.slice(0, limit).map((id) => {
        const badge = PROFILE_BADGE_CACHE.get(id);
        if (!badge) return null;
        return <BadgeGlyph key={id} badge={badge} size={size} title={badge.label[language]} />;
      })}
    </span>
  );
}
