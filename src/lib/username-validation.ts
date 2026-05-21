import { BLOCKED_USERNAME_WORDS } from "@/lib/blocked-username-words";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 15;

export type UsernameValidationResult =
  | { valid: true; username: string }
  | { valid: false; error: string };

function containsBlockedWord(username: string): boolean {
  const lower = username.toLowerCase();
  return BLOCKED_USERNAME_WORDS.some((word) => lower.includes(word));
}

export function validateUsername(raw: string): UsernameValidationResult {
  if (/\s/.test(raw)) {
    return { valid: false, error: "Username cannot contain spaces." };
  }

  const username = raw.trim();

  if (!username) {
    return { valid: false, error: "Please choose a username." };
  }

  if (username.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Username must be at least ${MIN_LENGTH} characters.`,
    };
  }

  if (username.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Username must be at most ${MAX_LENGTH} characters.`,
    };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      valid: false,
      error:
        "Username can only contain letters, numbers, and underscores.",
    };
  }

  if (containsBlockedWord(username)) {
    return {
      valid: false,
      error: "This username is not allowed. Please choose another.",
    };
  }

  return { valid: true, username };
}
