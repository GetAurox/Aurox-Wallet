import psl from "psl";

export function getDomain(target: string) {
  const domain = psl.get(target);

  if (domain === null) {
    console.error(`The domain "${target}" is not valid`);
  }

  return domain;
}

export function getSubdomain(domain: string) {
  const parsed = psl.parse(domain);

  if (parsed.error) {
    console.error("Failed to parse domain string:", parsed.error);

    return parsed.input;
  }

  if (!parsed.listed) {
    console.warn(`The domain "${parsed.domain ?? domain}" is not listed`);

    return parsed.input;
  }

  return parsed.subdomain;
}
