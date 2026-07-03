import dns from "node:dns/promises";
import net from "node:net";
import ipaddr from "ipaddr.js";

const blockedHosts = ["youtube.com", "youtu.be", "tiktok.com", "instagram.com", "facebook.com", "x.com", "twitter.com", "vimeo.com"];

export async function validateLegalDirectMediaUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Please enter a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (url.username || url.password) throw new Error("URLs with embedded credentials are not allowed.");

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) throw new Error("Local/private URLs are not allowed.");
  if (blockedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
    throw new Error("This platform is not supported. Use direct media URLs you own or are allowed to download.");
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length) throw new Error("Could not resolve host.");

  for (const address of addresses) {
    if (isPrivateIp(address.address)) throw new Error("Private network URLs are blocked for security.");
  }

  return url;
}

function isPrivateIp(value: string) {
  if (!net.isIP(value)) return true;
  const addr = ipaddr.parse(value);
  const range = addr.range();
  return ["private", "loopback", "linkLocal", "uniqueLocal", "unspecified", "broadcast", "carrierGradeNat", "reserved"].includes(range);
}

export function isDownloadableVideoType(contentType: string | null) {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return lower.startsWith("video/") || lower.includes("application/octet-stream");
}
