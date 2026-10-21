const PALETTES: Array<[string, string, string]> = [
  ["#8b5cf6", "#6366f1", "#22d3ee"],
  ["#f472b6", "#a855f7", "#6366f1"],
  ["#22d3ee", "#3b82f6", "#8b5cf6"],
  ["#34d399", "#22d3ee", "#3b82f6"],
  ["#fbbf24", "#f472b6", "#a855f7"],
  ["#fb7185", "#f97316", "#fbbf24"],
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function avatarDataUri(name: string): string {
  const [from, via, to] = PALETTES[hashName(name) % PALETTES.length];
  const initials = getInitials(name);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="55%" stop-color="${via}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <radialGradient id="shine" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#g)" />
      <rect width="160" height="160" rx="80" fill="url(#shine)" />
      <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter, Segoe UI, sans-serif" font-size="58" font-weight="700"
        fill="#ffffff" letter-spacing="-1">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
