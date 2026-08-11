export function extractXHandle(input: string): string {
  if (!input) return '';
  let str = input.trim();
  // Strip full URL prefixes e.g. https://x.com/username, https://twitter.com/username
  str = str.replace(/^https?:\/\/(www\.)?(x\.com|twitter\.com)\//i, '');
  str = str.replace(/^(www\.)?(x\.com|twitter\.com)\//i, '');
  // Strip leading @
  str = str.replace(/^@/, '');
  // Strip trailing path segments, query parameters, hashes
  str = str.split('/')[0].split('?')[0].split('#')[0];
  return str.trim();
}

export function formatQrUrl(rawUrl: string, handleFallback?: string): string {
  const trimmed = (rawUrl || '').trim();
  const fallbackHandle = extractXHandle(handleFallback || '');

  if (!trimmed) {
    return fallbackHandle ? `https://x.com/${fallbackHandle}` : 'https://x.com/hackerhousegoa';
  }

  // If already a complete http:// or https:// URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If starts with x.com/, twitter.com/, or @
  if (/^(www\.)?(x\.com|twitter\.com)\//i.test(trimmed) || /^@/.test(trimmed)) {
    const clean = extractXHandle(trimmed);
    return clean ? `https://x.com/${clean}` : 'https://x.com/hackerhousegoa';
  }

  // If it looks like a domain name with path e.g. github.com/username, linkedin.com/in/username
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Otherwise assume it's an X username/handle
  const clean = extractXHandle(trimmed);
  return clean ? `https://x.com/${clean}` : 'https://x.com/hackerhousegoa';
}
