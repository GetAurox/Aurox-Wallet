export function getHostnameWithoutSubdomain(hostname: string) {
  hostname = hostname.replace("www.", "");

  const splitHostname = hostname.split(".");

  if (splitHostname.length > 2) {
    splitHostname.shift();
  }

  return splitHostname.join(".");
}
