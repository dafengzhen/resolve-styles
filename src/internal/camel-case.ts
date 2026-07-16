/**
 * Cache for storing previously converted camelCase strings.
 * Improves performance by avoiding redundant string transformations.
 * Keys are original kebab-case strings, values are their camelCase equivalents.
 */
const camelCache = new Map<string, string>();

/**
 * Converts a kebab-case string to camelCase.
 *
 * This function transforms CSS property names (e.g., "background-color")
 * into their camelCase equivalents (e.g., "backgroundColor") for use in
 * JavaScript style objects.
 *
 * @param prop - The string to convert, typically a CSS property name in kebab-case
 * @returns The converted camelCase string, or the original string if:
 *          - It starts with `--` (CSS custom property/variable)
 *          - It doesn't contain any hyphens (`-`)
 *
 * @remarks
 * - CSS custom properties (e.g., `--my-variable`) are returned unchanged
 *   because they are case-sensitive and should not be transformed.
 * - Results are cached in `camelCache` for better performance on repeated calls.
 * - Only converts lowercase letters after hyphens to uppercase (e.g., `-webkit` → `webkit`).
 *
 * @example
 * ```ts
 * toCamelCase("background-color")   // "backgroundColor"
 * toCamelCase("font-size")          // "fontSize"
 * toCamelCase("border-radius")      // "borderRadius"
 * toCamelCase("--my-custom-prop")   // "--my-custom-prop" (unchanged)
 * toCamelCase("alreadyCamel")       // "alreadyCamel" (unchanged)
 * toCamelCase("-webkit-transform")  // "WebkitTransform" (note: CSS vendor prefixes may produce unexpected results)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/--* | CSS Custom Properties}
 */
export function toCamelCase(prop: string): string {
  // Skip transformation for CSS custom properties and strings without hyphens
  if (prop.startsWith('--') || !prop.includes('-')) {
    return prop;
  }

  // Check cache first for performance optimization
  const cached = camelCache.get(prop);
  if (cached !== undefined) {
    return cached;
  }

  // Convert kebab-case to camelCase by replacing `-letter` with `Letter`
  const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  // Store result in cache for future use
  camelCache.set(prop, camel);
  return camel;
}
