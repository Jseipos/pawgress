// share.ts — URL-based profile sharing for Guardian mode
// Encodes kid profile + pet name into a URL hash so a parent can text
// the link to their child and the child's browser auto-loads the profile.

import type { KidProfile } from "@/lib/storage";

/**
 * Encode a kid profile + pet name into a compact URL-safe string.
 * Uses base64url encoding of a JSON payload.
 */
export function encodeGuardianProfile(kid: KidProfile, petName: string): string {
  const payload = {
    n: kid.childName,      // name
    m: kid.mascot,         // mascot
    t: kid.targetDate,     // target date
    p: petName,            // pet name
    // PIN intentionally excluded — kid doesn't need it on their device
  };
  const json = JSON.stringify(payload);
  // base64url encode (handles unicode via encodeURIComponent)
  const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Build the full shareable guardian URL with encoded profile in the hash.
 */
export function buildGuardianShareUrl(kid: KidProfile, petName: string, origin: string): string {
  const encoded = encodeGuardianProfile(kid, petName);
  return `${origin}/guardian#p=${encoded}`;
}

/**
 * Decode a guardian profile from a URL hash.
 * Returns null if no valid profile is found.
 */
export function decodeGuardianProfile(hash: string): { childName: string; mascot: string; targetDate: string; petName: string } | null {
  try {
    // Extract the encoded payload from the hash
    const match = hash.match(/(?:^|#)p=([A-Za-z0-9_-]+)/);
    if (!match) return null;

    const b64url = match[1];
    // Restore base64url to standard base64
    let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    // Pad
    while (b64.length % 4) b64 += "=";

    // Decode
    const json = decodeURIComponent(
      atob(b64).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );

    const payload = JSON.parse(json);
    if (!payload || typeof payload.n !== "string") return null;

    return {
      childName: payload.n,
      mascot: payload.m,
      targetDate: payload.t,
      petName: payload.p,
    };
  } catch {
    return null;
  }
}
