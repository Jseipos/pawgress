// Mascot.tsx — Renders mascot image or emoji fallback
// Ayla & Flame use real illustrations, others use emoji

import type { MascotType } from "@/lib/storage";

const MASCOT_EMOJI: Record<MascotType, string> = {
  ayla: "🧒",
  flame: "🔥",
  star: "⭐",
  heart: "❤️",
  rocket: "🚀",
  paw: "🐾",
};

const MASCOT_IMAGES: Partial<Record<MascotType, string>> = {
  ayla: "/mascots/Ayla.svg",
  flame: "/mascots/Flame.svg",
};

interface MascotProps {
  type: MascotType;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<NonNullable<MascotProps["size"]>, string> = {
  sm: "w-12 h-12 text-3xl",
  md: "w-16 h-16 text-4xl",
  lg: "w-24 h-24 text-6xl",
  xl: "w-32 h-32 text-8xl",
};

export function getMascotEmoji(type: MascotType): string {
  return MASCOT_EMOJI[type] ?? "🐾";
}

export function hasMascotImage(type: MascotType): boolean {
  return type in MASCOT_IMAGES;
}

export function getMascotImage(type: MascotType): string | undefined {
  return MASCOT_IMAGES[type];
}

export default function Mascot({ type, size = "md", className = "", ariaLabel }: MascotProps) {
  const imagePath = MASCOT_IMAGES[type];
  const sizeClass = SIZE_CLASSES[size];
  const altText = ariaLabel ?? `Mascot: ${type}`;

  if (imagePath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imagePath}
        alt={altText}
        className={[
          "rounded-full object-cover border-2 border-purple-200 shadow-sm",
          sizeClass,
          className,
        ].join(" ")}
      />
    );
  }

  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        sizeClass,
        className,
      ].join(" ")}
      aria-label={altText}
      role="img"
    >
      {MASCOT_EMOJI[type] ?? "🐾"}
    </span>
  );
}
