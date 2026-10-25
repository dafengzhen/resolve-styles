/** Normalize CSS names to JavaScript style names, preserving custom properties. */
export function toCamelCase(property: string): string {
  if (property.startsWith('--')) {
    return property;
  }

  // The DOM spelling is msTransform, but WebkitTransform and MozTransform.
  return property
    .replace(/^-ms-/, 'ms-')
    .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
