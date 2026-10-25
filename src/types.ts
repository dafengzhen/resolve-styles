/** A fresh, mutable object with normalized property names and preserved values. */
export type ResolvedStyles = Record<string, StyleValue>;

/** Composable styles, including readonly arrays and conditional expressions. */
export type StyleInput = false | null | readonly StyleInput[] | StyleObject | undefined;

/** Flat inline declarations. Null deletes a property; undefined skips it. */
export interface StyleObject {
  readonly [property: string]: null | StyleValue | undefined;
}

/** A CSS value. Units must be supplied explicitly when needed by the consumer. */
export type StyleValue = number | string;
