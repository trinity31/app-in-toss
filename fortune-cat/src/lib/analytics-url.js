// Match the parsed hostname so public names/paths containing "localhost" still collect.
export function isAnalyticsBackendAllowed(value) {
  try {
    const url = new URL(value || '');
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
    if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return false;
    const ipv4 = host.split('.').map(Number);
    const localV4 = octets => octets[0] === 0 || octets[0] === 10 || octets[0] === 127 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) || (octets[0] === 169 && octets[1] === 254);
    if (ipv4.length === 4 && ipv4.every(n => Number.isInteger(n) && n >= 0 && n <= 255)) return !localV4(ipv4);
    if (host.includes(':')) {
      const halves = host.split('::');
      const left = halves[0] ? halves[0].split(':').map(n => parseInt(n, 16)) : [];
      const right = halves[1] ? halves[1].split(':').map(n => parseInt(n, 16)) : [];
      const words = halves.length === 2 ? [...left, ...Array(8 - left.length - right.length).fill(0), ...right] : left;
      if (words.every(n => n === 0) || (words.slice(0, 7).every(n => n === 0) && words[7] === 1)) return false;
      if ((words[0] & 0xfe00) === 0xfc00 || (words[0] & 0xffc0) === 0xfe80) return false;
      if (words.slice(0, 5).every(n => n === 0) && words[5] === 0xffff) {
        return !localV4([words[6] >> 8, words[6] & 255, words[7] >> 8, words[7] & 255]);
      }
    }
    return true;
  } catch { return false; }
}
