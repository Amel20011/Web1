/**
 * Auth Logic for Ban Spesialis
 * - Gmail normalization and validation
 * - 4-digit PIN verification and simulated hashing
 * - Rate limiting helper
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidGmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  // Must end in @gmail.com or @googlemail.com and have valid local part
  const gmailRegex = /^[a-zA-Z0-9.+_-]+@(gmail\.com|googlemail\.com)$/;
  return gmailRegex.test(normalized);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string, salt: string = 'ban-spesialis-salt'): Promise<string> {
  if (!isValidPin(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  // In browser/Node environment, compute SHA-256 hash
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for test environments without subtle crypto
  let hash = 0;
  const str = `${salt}:${pin}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

export interface RateLimitState {
  failedAttempts: number;
  lockedUntil: number | null;
}

export function checkPinRateLimit(
  currentState: RateLimitState,
  nowMs: number = Date.now()
): { allowed: boolean; remainingLockSeconds: number } {
  if (currentState.lockedUntil && currentState.lockedUntil > nowMs) {
    const remainingSec = Math.ceil((currentState.lockedUntil - nowMs) / 1000);
    return { allowed: false, remainingLockSeconds: remainingSec };
  }
  return { allowed: true, remainingLockSeconds: 0 };
}

export function registerPinAttempt(
  currentState: RateLimitState,
  isCorrect: boolean,
  nowMs: number = Date.now()
): RateLimitState {
  if (isCorrect) {
    return { failedAttempts: 0, lockedUntil: null };
  }
  const failedAttempts = currentState.failedAttempts + 1;
  // If 5 failed attempts, lock for 60 seconds. If 10, lock for 300 seconds
  let lockedUntil: number | null = null;
  if (failedAttempts >= 5) {
    const lockDuration = failedAttempts >= 8 ? 300 * 1000 : 60 * 1000;
    lockedUntil = nowMs + lockDuration;
  }
  return { failedAttempts, lockedUntil };
}
