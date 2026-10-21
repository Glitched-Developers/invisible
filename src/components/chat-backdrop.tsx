import { useMemo } from "react";
import type { CSSProperties } from "react";

const PARTICLE_COUNT = 52;

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function ChatBackdrop() {
  const particles = useMemo(() => {
    const random = mulberry32(0x9e3779b9);
    const laneWidth = 96 / PARTICLE_COUNT;
    const lanes = Array.from(
      { length: PARTICLE_COUNT },
      (_, index) => 2 + index * laneWidth + random() * laneWidth,
    );

    for (let index = lanes.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [lanes[index], lanes[swapIndex]] = [lanes[swapIndex], lanes[index]];
    }

    return lanes.map((left, index) => {
      const duration = 10 + random() * 22;
      return {
        left: `${left}%`,
        size: 1.2 + random() * 2.4,
        delay: `-${(random() * duration).toFixed(2)}s`,
        duration: `${duration.toFixed(2)}s`,
        drift: `${(random() > 0.5 ? 1 : -1) * (16 + random() * 72)}px`,
        opacity: 0.35 + random() * 0.6,
        color:
          index % 3 === 0
            ? "bg-cyan-300 text-cyan-300"
            : index % 3 === 1
              ? "bg-violet-300 text-violet-300"
              : "bg-fuchsia-300 text-fuchsia-300",
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="chat-atmosphere pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(139,92,246,0.12),transparent_60%)]" />

      <div className="chat-orb -left-24 top-[8%] h-72 w-72 bg-violet-500/20 dark:bg-violet-600/25" />
      <div className="chat-orb chat-orb-b right-[-6rem] top-[24%] h-80 w-80 bg-cyan-400/15 dark:bg-cyan-500/20" />
      <div className="chat-orb chat-orb-c bottom-[-8rem] left-[28%] h-96 w-96 bg-fuchsia-500/10 dark:bg-fuchsia-600/15" />
      <div className="chat-orb chat-orb-a bottom-[18%] right-[18%] h-56 w-56 bg-indigo-500/15 dark:bg-indigo-500/20" />

      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-violet-400/[0.07]">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/60 shadow-[0_0_16px_2px_rgba(167,139,250,0.7)]" />
        <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-300/60 shadow-[0_0_14px_2px_rgba(103,232,249,0.6)]" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[48rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slower rounded-full border border-dashed border-cyan-300/[0.06]" />

      {particles.map((particle, index) => (
        <span
          key={index}
          className={`chat-particle ${particle.color}`}
          style={
            {
              left: particle.left,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              "--particle-drift": particle.drift,
              "--particle-opacity": particle.opacity,
            } as CSSProperties
          }
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
    </div>
  );
}
