/** Returns success indicator if the string can be parsed as a URL */
export function tryParseURL(url: string | undefined) {
  try {
    new URL(url as string);
    return true;
  } catch {
    return false;
  }
}
