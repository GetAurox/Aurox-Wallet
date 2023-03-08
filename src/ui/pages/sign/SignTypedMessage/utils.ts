/** Maps/flattens complex object into flat Array of { prop, value } */
export function mapMessageDataStructure(message: object) {
  const entries: { prop: string | null; value: string | number | null }[] = [];

  for (const [key, value] of Object.entries(message)) {
    if (typeof value === "string" || typeof value === "number") {
      entries.push({ prop: key, value });

      continue;
    }

    if (Array.isArray(value)) {
      entries.push({ prop: key, value: null });

      for (const entry of value) {
        if (typeof entry === "string" || typeof entry === "number") {
          entries.push({ prop: null, value: entry });

          continue;
        }

        entries.push(...mapMessageDataStructure(entry));
      }

      continue;
    }

    if (typeof value === "object") {
      entries.push({ prop: key, value: null }, ...mapMessageDataStructure(value));
    }
  }

  return entries;
}
