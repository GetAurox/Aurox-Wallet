/**
 * Collapses a long identifier string such as txId, ethAddress, contractAddress, etc... to a short text with ellipsis in the middle
 * @param identifier the text to shorten
 * @param options controls the behavior of the colllapsing algorithm
 * @param options.showRight How many characters to show from the right, Default: 4
 * @param options.showLeft How many characters to show from the left, Default: 4
 * @returns The shortened text
 */
export function collapseIdentifier(identifier: string, options?: { showRight: number; showLeft: number }) {
  if (typeof identifier !== "string") {
    return "";
  }

  const showRight = options?.showRight ?? 4;
  const showLeft = options?.showLeft ?? 4;

  if (identifier.length > showRight + showLeft + 3) {
    const firstPart = identifier.slice(0, showRight);
    const lastPart = identifier.substring(identifier.length - showLeft);

    return `${firstPart}...${lastPart}`;
  }

  return identifier;
}
