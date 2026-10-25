import type { StyleInput, StyleObject } from './types.js';

import { toCamelCase } from './internal/camel-case.js';
import { warn } from './internal/warn.js';

export type { StyleInput, StyleObject, StylePrimitive } from './types.js';

/**
 * Maximum number of iterations allowed to prevent infinite loops
 * when processing deeply nested or circular style structures.
 */
const MAX_ITERATIONS = 10000;

/**
 * Resolves and flattens multiple style inputs into a single style object.
 *
 * This function processes a list of style inputs (objects, arrays, primitives)
 * and merges them into a flat record of camelCase CSS properties with string values.
 * It handles nested objects, array composition, vendor prefixes, and conditional
 * styles with `null`/`undefined` values.
 *
 * @param inputs - A variadic list of style inputs to resolve and merge
 * @returns A flat record where keys are camelCase CSS property names and values are string CSS values
 *
 * ### Processing Order
 * - Styles are processed in reverse order (last input has highest precedence)
 * - For arrays, elements are processed in reverse order (last element has highest precedence)
 * - Nested objects are flattened with hyphen-separated keys (e.g., `{ "&:hover": { color: "red" } }` → `{ "&:hover-color": "red" }`)
 *
 * ### Value Handling
 * - **Strings**: Used directly as CSS values
 * - **Numbers**: Converted to strings (e.g., `16` → `"16"`)
 * - **Objects**: Recursively processed and flattened
 * - **Arrays**: Flattened and merged
 * - **`null` / `undefined`**: Removes the property from the final result
 * - **Booleans**: Ignored with a warning
 * - **Non-finite numbers**: Skipped with a warning
 *
 * ### Performance & Safety
 * - Uses a stack-based approach to avoid recursion limits
 * - Detects circular references and throws an error
 * - Implements iteration limits to prevent infinite loops
 * - Caches camelCase conversions for performance
 *
 * @throws {Error} When maximum iterations are exceeded (possible circular reference or overly deep structure)
 * @throws {Error} When a circular reference is detected in the style objects
 *
 * @example
 * ```ts
 * // Basic usage with object styles
 * resolveStyles(
 *   { color: "red", fontSize: 16 },
 *   { backgroundColor: "blue" }
 * )
 * // Returns: { color: "red", fontSize: "16", backgroundColor: "blue" }
 *
 * // Array composition (last element wins)
 * resolveStyles([
 *   { color: "red" },
 *   { color: "blue", fontSize: 14 }
 * ])
 * // Returns: { color: "blue", fontSize: "14" }
 *
 * // Nested objects with prefixes
 * resolveStyles({
 *   "&:hover": {
 *     color: "red",
 *     backgroundColor: "blue"
 *   }
 * })
 * // Returns: { "&:hover-color": "red", "&:hover-backgroundColor": "blue" }
 *
 * // Conditional styles with null/undefined
 * resolveStyles(
 *   { color: "red" },
 *   isActive && { color: "blue" },  // false will be skipped
 *   { fontSize: 16 }
 * )
 * // Returns: { color: "red", fontSize: "16" } if isActive is false
 *
 * // Null removes properties
 * resolveStyles(
 *   { color: "red", fontSize: "16px" },
 *   { fontSize: null }  // Removes fontSize from result
 * )
 * // Returns: { color: "red" }
 *
 * // Numeric values are converted to strings without automatic units
 * resolveStyles(
 *   { width: 100, height: 200, opacity: 0.5 }
 * )
 * // Returns: { width: "100", height: "200", opacity: "0.5" }
 * // Note: Use explicit strings for units: { width: "100px", height: "200px" }
 * ```
 *
 * @see {@link StyleInput} - Input types accepted by this function
 * @see {@link toCamelCase} - How property names are converted
 */
export function resolveStyles(...inputs: StyleInput[]): Record<string, string> {
  const result: Record<string, string> = {};
  const stack: StyleInput[] = [];
  const prefixes: Array<string | undefined> = [];

  // Initialize stack with inputs in reverse order
  // Last input has highest precedence
  for (let i = inputs.length - 1; i >= 0; i--) {
    if (inputs[i] != null) {
      stack.push(inputs[i]);
      prefixes.push(undefined);
    }
  }

  // Track visited objects to detect circular references
  const seenObjects = new WeakSet<object>();
  let iterations = 0;

  // Process stack until empty
  while (stack.length > 0) {
    // Prevent infinite loops from circular references or deeply nested structures
    if (++iterations > MAX_ITERATIONS) {
      throw new Error(
        'resolveStyles: maximum iterations exceeded, possible circular reference or overly deep structure.',
      );
    }

    const current = stack.pop()!;
    const prefix = prefixes.pop();

    // Skip null/undefined values
    if (current == null) {
      continue;
    }

    // Handle string inputs (deprecated)
    if (typeof current === 'string') {
      warn(
        'String CSS input is no longer supported. Please use object syntax instead. ' +
          'Example: resolveStyles({ color: "red", fontSize: 16 })',
      );
      continue;
    }

    // Handle top-level numbers (deprecated)
    if (typeof current === 'number') {
      warn('Top-level number is ignored, use an object instead.');
      continue;
    }

    // Handle arrays - flatten and reverse for correct precedence
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) {
        if (current[i] != null) {
          stack.push(current[i]);
          prefixes.push(undefined);
        }
      }
      continue;
    }

    // Skip non-object values
    if (typeof current !== 'object') {
      continue;
    }

    // Detect circular references
    if (seenObjects.has(current)) {
      throw new Error('resolveStyles: circular reference detected.');
    }
    seenObjects.add(current);

    // Process all keys in the current object
    const keys = Object.keys(current);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      // Skip empty keys with warning
      if (!key) {
        if (prefix === undefined) {
          warn('Empty property key encountered and skipped.');
        }
        continue;
      }

      const value = (current as StyleObject)[key];

      // Build full key with prefix (for nested objects)
      const fullKey = prefix === undefined ? key : `${prefix}-${key}`;
      const camelKey = toCamelCase(fullKey);

      // Null/undefined removes the property
      if (value === null || value === undefined) {
        delete result[camelKey];
        continue;
      }

      // Nested object - push to stack for further processing
      if (typeof value === 'object' && !Array.isArray(value)) {
        stack.push(value);
        prefixes.push(fullKey);
        continue;
      }

      // String values - use directly
      if (typeof value === 'string') {
        result[camelKey] = value;
        continue;
      }

      // Number values - convert to string without automatic units
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
          warn(`Invalid number value for "${fullKey}": ${value}. Skipped.`);
          continue;
        }
        result[camelKey] = String(value);
        continue;
      }

      // Boolean values - ignored with warning
      if (typeof value === 'boolean') {
        warn(`Boolean value for "${fullKey}" is not supported and was ignored.`);
      }
    }
  }

  return result;
}

export default resolveStyles;
