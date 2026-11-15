import { useId } from "react";

export default function CreamJar({
  body = "#F7E7D6",
  cap = "#C6A27A",
  label = "ELORA",
  className = "",
}) {
  const rawId = useId().replace(/:/g, "");

  return (
    <svg className={`cream-jar ${className}`.trim()} viewBox="0 0 200 250" aria-hidden="true">
      <defs>
        <linearGradient id={`${rawId}-glass`} x1="20%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="38%" stopColor={body} />
          <stop offset="100%" stopColor={cap} />
        </linearGradient>
        <linearGradient id={`${rawId}-cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="40%" stopColor={cap} />
          <stop offset="100%" stopColor={cap} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="230" rx="62" ry="10" fill="rgba(36,30,26,0.12)" />
      <rect x="79" y="34" width="42" height="12" rx="3" fill={`url(#${rawId}-cap)`} />
      <rect x="60" y="44" width="80" height="22" rx="6" fill={cap} />
      <path
        d="M44 78h112c5 0 10 7 10 16v88c0 24-22 40-66 40s-66-16-66-40V94c0-9 5-16 10-16Z"
        fill={`url(#${rawId}-glass)`}
      />
      <path
        d="M62 92c10 16 18 16 28 0"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="68" y="118" width="64" height="46" rx="2" fill="rgba(255,252,248,0.82)" />
      <text
        x="100"
        y="138"
        textAnchor="middle"
        fontFamily="Outfit, sans-serif"
        fontSize="10"
        letterSpacing="1.8"
        fill="#241E1A"
      >
        ELORA
      </text>
      <text
        x="100"
        y="154"
        textAnchor="middle"
        fontFamily="Outfit, sans-serif"
        fontSize="8"
        fill="#6E625A"
      >
        {label}
      </text>
    </svg>
  );
}
