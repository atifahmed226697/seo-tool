import { BlockList, isIP } from "node:net";

const registries = new Set([
  "rdap.arin.net", "rdap.db.ripe.net", "rdap.apnic.net", "rdap.lacnic.net",
  "rdap.afrinic.net",
]);

interface Bootstrap {
  services: [string[], string[]][];
}

interface NetworkRecord {
  name?: string;
  handle?: string;
  country?: string;
  entities?: { roles?: string[]; vcardArray?: [string, [string, unknown, string, unknown][]] }[];
}

export async function lookupIpNetwork(address: string) {
  const version = isIP(address);
  if (!version) return null;
  const family = version === 4 ? "ipv4" : "ipv6";
  const response = await fetch(`https://data.iana.org/rdap/${family}.json`, {
    redirect: "error",
    signal: AbortSignal.timeout(3_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error("The IP registry directory is unavailable.");
  const { services } = await response.json() as Bootstrap;
  let match: URL | undefined;
  let longestPrefix = -1;

  for (const [ranges, endpoints] of services) {
    const endpoint = endpoints.map(value => new URL(value)).find(url =>
      url.protocol === "https:" && !url.port && !url.username && !url.password && registries.has(url.hostname)
    );
    if (!endpoint) continue;
    for (const range of ranges) {
      const [network, size] = range.split("/");
      const prefix = Number(size);
      if (prefix <= longestPrefix) continue;
      const block = new BlockList();
      block.addSubnet(network, prefix, family);
      if (block.check(address, family)) {
        match = endpoint;
        longestPrefix = prefix;
      }
    }
  }

  if (!match) return null;
  const base = match.href.endsWith("/") ? match.href : `${match.href}/`;
  const registry = await fetch(new URL(`ip/${encodeURIComponent(address)}`, base), {
    redirect: "error",
    signal: AbortSignal.timeout(4_000),
    next: { revalidate: 3_600 },
  });
  if (!registry.ok) return null;
  const record = await registry.json() as NetworkRecord;
  const registrant = record.entities?.find(entity => entity.roles?.includes("registrant"));
  const name = registrant?.vcardArray?.[1]?.find(entry => entry[0] === "fn")?.[3];
  return {
    organization: typeof name === "string" ? name : undefined,
    network: record.name || record.handle,
    country: record.country,
  };
}
