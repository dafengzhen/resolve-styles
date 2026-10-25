import type { ResolvedStyles, StyleInput } from './types.js';

import { toCamelCase } from './internal/camel-case.js';

export type { ResolvedStyles, StyleInput, StyleObject, StyleValue } from './types.js';

/**
 * Merges inline styles from left to right without changing the inputs.
 * Arrays compose styles; false, null and undefined inputs are skipped.
 * Property values retain their type: null deletes, undefined leaves the previous value.
 *
 * @throws {TypeError} For invalid inputs, invalid declarations or circular arrays.
 *
 * @example
 * resolveStyles({ 'font-size': 16, color: 'red' }, [false, { color: 'blue' }]);
 * // { fontSize: 16, color: 'blue' }
 */
export function resolveStyles(...inputs: readonly StyleInput[]): ResolvedStyles {
  const result: ResolvedStyles = {};
  const activeArrays = new WeakSet<readonly StyleInput[]>();
  const stack = [{ index: 0, inputs }];

  // Frames keep traversal iterative and track ancestors rather than all visited arrays.
  while (stack.length > 0) {
    const frame = stack[stack.length - 1]!;
    if (frame.index === frame.inputs.length) {
      activeArrays.delete(frame.inputs);
      stack.pop();
      continue;
    }

    const input = frame.inputs[frame.index++];
    if (input === false || input == null) {
      continue;
    }

    if (Array.isArray(input)) {
      if (activeArrays.has(input)) {
        throw new TypeError('resolveStyles: circular style array.');
      }
      activeArrays.add(input);
      stack.push({ index: 0, inputs: input });
      continue;
    }

    if (typeof input !== 'object') {
      throw new TypeError('resolveStyles: expected a style object or an array of style inputs.');
    }

    const prototype: unknown = Object.getPrototypeOf(input);
    if (prototype !== null && prototype !== Object.prototype) {
      throw new TypeError('resolveStyles: expected a plain style object.');
    }

    for (const [property, value] of Object.entries(input)) {
      const name = property.trim();
      if (name.length === 0) {
        throw new TypeError('resolveStyles: property names must not be empty.');
      }
      const key = toCamelCase(name);

      if (value === undefined) {
        continue;
      }
      if (value === null) {
        delete result[key];
        continue;
      }
      if (typeof value !== 'string' && (typeof value !== 'number' || !Number.isFinite(value))) {
        throw new TypeError(
          `resolveStyles: "${property}" must be a string, a finite number, null or undefined.`,
        );
      }

      // Define own properties so names such as __proto__ cannot change the prototype.
      Object.defineProperty(result, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
    }
  }

  return result;
}
