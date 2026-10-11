import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10_000;

export class ImportError extends Error {}

/** Blocks requests to localhost / private network addresses (the server shouldn't be usable as a proxy). */
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v6 = ip.toLowerCase();
    if (v6 === "::1" || v6 === "::") return true;
    if (v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80")) return true;
    const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateAddress(mapped[1]) : false;
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ImportError("Only http(s) links can be imported.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new ImportError("That address can't be imported.");
  }
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => {
    throw new ImportError("Couldn't find that website. Check the link.");
  });
  if (addresses.some((a) => isPrivateAddress(a.address))) {
    throw new ImportError("That address can't be imported.");
  }
}

/** Fetches a page's HTML, following redirects manually so each hop is checked. */
export async function fetchPage(rawUrl: string): Promise<{ html: string; finalUrl: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new ImportError("That doesn't look like a valid link.");
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url);

    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "nl-BE,nl;q=0.9,en;q=0.8",
        },
        cache: "no-store",
      });
    } catch (e) {
      if (e instanceof Error && e.name === "TimeoutError") {
        throw new ImportError("The website took too long to respond.");
      }
      throw new ImportError("Couldn't reach that website.");
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new ImportError("The website redirected without a target.");
      url = new URL(location, url);
      continue;
    }

    if (!res.ok) {
      throw new ImportError(
        res.status === 403 || res.status === 429
          ? "This website blocks automatic imports. You'll have to add this recipe by hand."
          : `The website returned an error (${res.status}).`
      );
    }

    const type = res.headers.get("content-type") ?? "";
    if (type && !type.includes("html")) {
      throw new ImportError("That link isn't a web page.");
    }

    const html = await readCapped(res);
    return { html, finalUrl: url.toString() };
  }

  throw new ImportError("Too many redirects.");
}

async function readCapped(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder("utf-8").decode(Buffer.concat(chunks));
}
