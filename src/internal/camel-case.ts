const camelCache = new Map<string, string>();

export function toCamelCase(prop: string): string {
  if (prop.startsWith('--') || !prop.includes('-')) {
    return prop;
  }

  const cached = camelCache.get(prop);
  if (cached !== undefined) {
    return cached;
  }

  const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  camelCache.set(prop, camel);
  return camel;
}
