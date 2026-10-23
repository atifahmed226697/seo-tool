/**
 * Pure, typed text transformation and analytics utility functions for Case Converter.
 */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  lines: number;
}

/**
 * Words that should remain lowercase in Title Case unless they appear
 * at the start of the title, line, or directly after major punctuation.
 */
const MINOR_WORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "in",
  "on",
  "and",
  "or",
  "to",
  "for",
]);

/**
 * Convert string to UPPERCASE
 */
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

/**
 * Convert string to lowercase
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

/**
 * Convert string to Title Case
 * Preserves specified small words (a, an, the, of, in, on, and, or, to, for) in lowercase
 * except at the beginning of the title, line, or after sentence/clause breaks.
 */
export function toTitleCase(text: string): string {
  if (!text) return "";

  // Split into tokens preserving words, whitespace, and punctuation
  // Matches words with optional apostrophes, and other sequences
  return text
    .toLowerCase()
    .replace(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g, (word, index) => {
      // Check if this word is the first word in the entire string or on a new line
      const precedingText = text.slice(0, index);
      const isStart = precedingText.trim().length === 0;
      
      // Check if preceded by a sentence terminator or clause break (. ! ? : - \n)
      const isAfterMajorBreak = /[:.!?\-—\n]\s*$/.test(precedingText);

      if (isStart || isAfterMajorBreak) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      if (MINOR_WORDS.has(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}

/**
 * Convert string to Sentence case
 * Capitalizes the first letter of each sentence, including after . ! ?
 * and handles multiple spaces, tabs, and newlines correctly.
 */
export function toSentenceCase(text: string): string {
  if (!text) return "";

  // Lowercase everything first
  const lower = text.toLowerCase();

  // Capitalize:
  // 1. The start of the string (ignoring leading whitespace)
  // 2. Any character following a sentence terminator (. ! ?) and optional whitespace/quotes
  // 3. Any character at the start of a new line
  return lower.replace(
    /(^|[\r\n]+|[.!?]+["')\]}]*\s+)([a-z])/g,
    (_, prefix: string, letter: string) => prefix + letter.toUpperCase()
  );
}

/**
 * Calculate live statistics for a given text
 */
export function getTextStats(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      lines: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Count words: non-whitespace chunks
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  // Count lines: number of newline splits
  const lines = text.split(/\r\n|\r|\n/).length;

  // Count sentences: match non-empty segments terminating in [.!?] or ending with characters
  let sentences = 0;
  if (trimmed) {
    const sentenceMatches = trimmed.match(/[^.!?]+(?:[.!?]+|$)/g);
    sentences = sentenceMatches ? sentenceMatches.filter((s) => s.trim().length > 0).length : 0;
  }

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    lines,
  };
}
