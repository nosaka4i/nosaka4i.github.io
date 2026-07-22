// The Nosaka mark's ring geometry — an organic, sine-wave-modulated circle,
// kept identical to the algorithm in the main `nosaka` app repo's
// tools/icon/generate-icon.js, so the mark used across the marketing site
// stays faithful to the real app icon rather than an approximation.

export type RingSpec = {
  radius: number;
  amplitude: number;
  phase: number;
  opacity: number;
};

// Normalized to a 200x200 viewBox (center 100,100) — the icon generator
// uses a 1024x1024 canvas with center 512, radii ~300/266; scaled down here
// by the same ratio (200/682 of the original working radius) rather than
// reused verbatim, since this mark is drawn much smaller on a page than as
// an app icon.
export const RING_COLOR = "#04d9ff";
export const RING_STROKE_WIDTH = 5;
export const RINGS: RingSpec[] = [
  { radius: 58.8, amplitude: 1.57, phase: 0.6, opacity: 0.55 },
  { radius: 52.2, amplitude: 1.37, phase: 2.7, opacity: 0.85 },
];

export function organicRingPath(
  cx: number,
  cy: number,
  radius: number,
  amplitude: number,
  phase: number,
  points = 180
): string {
  let d = "";
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const wave =
      Math.sin(angle * 5 + phase) * amplitude +
      Math.sin(angle * 9 - phase * 0.7) * amplitude * 0.2;
    const r = radius + wave;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2) + " ";
  }
  return d + "Z";
}

export function getRingPaths(): { d: string; opacity: number }[] {
  return RINGS.map((r) => ({
    d: organicRingPath(100, 100, r.radius, r.amplitude, r.phase),
    opacity: r.opacity,
  }));
}
