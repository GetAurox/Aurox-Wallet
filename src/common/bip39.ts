import { generateMnemonic, validateMnemonic } from "bip39";
import uniq from "lodash/uniq";

export function mnemonicsFromString(value: string) {
  return value.trim().split(/\s+/g);
}

export function mnemonicsToString(mnemonics: string[]) {
  return mnemonics.join(" ");
}

/**
 * Get mnemonics with unique words
 */
export function generateMnemonics() {
  while (true) {
    const mnemonics = mnemonicsFromString(generateMnemonic());
    const uniqMnemonics = uniq(mnemonics);

    if (uniqMnemonics.length === 12) {
      return mnemonics;
    }
  }
}

export function validateMnemonicsValueLength(value: string) {
  const length = mnemonicsFromString(value).length;

  return length >= 12 && length <= 24 && length % 3 === 0;
}

export function validateMnemonicsValueWordlist(value: string) {
  return validateMnemonic(value);
}
