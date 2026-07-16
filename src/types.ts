/**
 * Represents a primitive value that can be used as a style value.
 * - `string`: CSS property value (e.g., "10px", "red", "block")
 * - `number`: Numeric value (typically converted to pixels in CSS)
 * - `null` | `undefined`: Falsy values that are typically ignored or treated as empty
 */
export type StylePrimitive = string | number | null | undefined;

/**
 * Represents a style object where keys are CSS property names and values are nested style inputs.
 * Allows for recursive style definitions, enabling nested selectors or pseudo-classes.
 *
 * @example
 * ```ts
 * const styles: StyleObject = {
 *   color: "blue",
 *   "&:hover": {
 *     color: "red"
 *   },
 *   "@media (min-width: 768px)": {
 *     fontSize: "20px"
 *   }
 * };
 * ```
 */
export interface StyleObject {
  [key: string]: StyleInput;
}

/**
 * Represents any valid style input, which can be:
 * - A primitive value (`StylePrimitive`)
 * - A nested style object (`StyleObject`)
 * - An array of style inputs (flattened and merged at runtime)
 *
 * This recursive union type allows for flexible and composable style definitions,
 * commonly used in CSS-in-JS libraries or runtime style processors.
 *
 * @example
 * ```ts
 * // Primitive
 * const primitive: StyleInput = "12px";
 *
 * // Nested object
 * const object: StyleInput = { fontSize: "16px", color: "green" };
 *
 * // Array of mixed inputs
 * const array: StyleInput = [
 *   { color: "red" },
 *   "bold",
 *   { fontSize: "14px" },
 *   null,
 *   undefined
 * ];
 * ```
 */
export type StyleInput = StylePrimitive | StyleObject | StyleInput[];
