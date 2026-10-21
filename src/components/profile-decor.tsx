import {
  getAvatarDecoration,
  type AvatarDecorationId,
  type ProfileBannerPattern,
  type ProfileEffectId,
} from "../lib/profile";
import { cn } from "../lib/utils";

interface ProfileAvatarProps {
  src: string;
  alt: string;
  decoration: AvatarDecorationId;
  className?: string;
  imageClassName?: string;
  shape?: "square" | "circle";
}

export function ProfileAvatar({
  src,
  alt,
  decoration,
  className,
  imageClassName,
  shape = "square",
}: ProfileAvatarProps) {
  const decorationDef = getAvatarDecoration(decoration);
  const isCircle = shape === "circle";
  const hasDecoration = decorationDef.id !== "none";

  return (
    <span
      className={cn(
        "profile-avatar relative inline-flex shrink-0",
        isCircle && "avatar-shape-circle",
        className,
      )}
    >
      {hasDecoration && (
        <span
          className={cn("avatar-deco-ring", decorationDef.ringClass)}
          style={{ filter: `drop-shadow(0 0 8px ${decorationDef.glow})` }}
          aria-hidden="true"
        />
      )}
      {decorationDef.id === "orbit" && (
        <span className="avatar-deco-orbit-wrap" aria-hidden="true">
          <span className="avatar-deco-orbit-dot" />
        </span>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "relative z-10 h-full w-full object-cover ring-4 ring-card",
          isCircle ? "rounded-full" : "rounded-[1.4rem]",
          imageClassName,
        )}
      />
    </span>
  );
}

export function ProfileBannerPattern({
  pattern,
  className,
}: {
  pattern: ProfileBannerPattern;
  className?: string;
}) {
  return <span aria-hidden="true" className={cn("profile-banner-pattern", `banner-pattern-${pattern}`, className)} />;
}

const SPARKLES = Array.from({ length: 10 }, (_, index) => ({
  left: `${(index * 37 + 11) % 92}%`,
  top: `${(index * 29 + 13) % 68}%`,
  delay: `${(index % 5) * 0.65}s`,
  duration: `${4.4 + (index % 4) * 0.75}s`,
  size: index % 3 === 0 ? 4 : 3,
}));

const EMBERS = Array.from({ length: 8 }, (_, index) => ({
  left: `${(index * 43 + 7) % 94}%`,
  delay: `${(index % 6) * 0.8}s`,
  duration: `${5.2 + (index % 3) * 0.9}s`,
  size: index % 2 === 0 ? 4 : 3,
}));

export function ProfileEffectLayer({
  effect,
  className,
}: {
  effect: ProfileEffectId;
  className?: string;
}) {
  if (effect === "none") return null;

  return (
    <div
      className={cn("profile-effect-layer pointer-events-none absolute inset-0 z-30 overflow-hidden", className)}
      aria-hidden="true"
    >
      {effect === "sparkles" && (
        <>
          {SPARKLES.map((sparkle, index) => (
            <span
              key={index}
              className="profile-sparkle"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: sparkle.delay,
                animationDuration: sparkle.duration,
              }}
            />
          ))}
          <span className="profile-sparkle-glow" />
        </>
      )}

      {effect === "embers" && (
        <>
          {EMBERS.map((ember, index) => (
            <span
              key={index}
              className="profile-ember"
              style={{
                left: ember.left,
                width: ember.size,
                height: ember.size,
                animationDelay: ember.delay,
                animationDuration: ember.duration,
              }}
            />
          ))}
        </>
      )}

      {effect === "aurora" && (
        <>
          <span className="profile-aurora-wave profile-aurora-wave-a" />
          <span className="profile-aurora-wave profile-aurora-wave-b" />
          <span className="profile-aurora-glow" />
        </>
      )}

      {effect === "scan" && (
        <>
          <span className="profile-scan-grid" />
          <span className="profile-scanline" />
        </>
      )}

      {effect === "holo" && (
        <>
          <span className="profile-holo-sheen" />
          <span className="profile-holo-grain" />
        </>
      )}
    </div>
  );
}
