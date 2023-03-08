export function getHostname(url: string) {
  try {
    let { hostname } = new URL(url);

    hostname = hostname.replace("www.", "");

    const splitHostname = hostname.split(".");

    splitHostname.pop();

    hostname = splitHostname.join(".");

    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    return "";
  }
}
