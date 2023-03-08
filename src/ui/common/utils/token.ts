export function getAvatarAltChar(str: string) {
  return str
    ?.replace(/[^a-z0-9]/gi, "")
    .charAt(0)
    .toUpperCase();
}
