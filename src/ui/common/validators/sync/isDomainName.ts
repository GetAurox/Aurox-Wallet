export function isDomainName(domainLike: unknown): domainLike is string {
  if (typeof domainLike !== "string") {
    return false;
  }

  // eslint-disable-next-line no-useless-escape
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]*/g.test(domainLike);
}
