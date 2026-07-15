import { parseStyleString } from './internal/parse-style-string.js';
import { toCamelCase } from './internal/camel-case.js';
import { warn } from './internal/warn.js';
import { addUnit } from './unit-map.js';
import type { StyleInput, StyleObject } from './types.js';

export type { StyleInput, StyleObject, StylePrimitive } from './types.js';
export { configureUnitMap, DEFAULT_UNIT_MAP, getUnitMap } from './unit-map.js';

const MAX_ITERATIONS = 10000;

export function resolveStyles(...inputs: StyleInput[]): Record<string, string> {
  const result: Record<string, string> = {};
  const stack: StyleInput[] = [];
  const prefixes: Array<string | undefined> = [];

  for (let i = inputs.length - 1; i >= 0; i--) {
    if (inputs[i] != null) {
      stack.push(inputs[i]);
      prefixes.push(undefined);
    }
  }

  const seenObjects = new WeakSet<object>();
  let iterations = 0;

  while (stack.length > 0) {
    if (++iterations > MAX_ITERATIONS) {
      throw new Error(
        'resolveStyles: maximum iterations exceeded, possible circular reference or overly deep structure.',
      );
    }

    const current = stack.pop()!;
    const prefix = prefixes.pop();

    if (current == null) {
      continue;
    }

    if (typeof current === 'string') {
      parseStyleString(current, result);
      continue;
    }

    if (typeof current === 'number') {
      warn('Top-level number is ignored, use an object instead.');
      continue;
    }

    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) {
        if (current[i] != null) {
          stack.push(current[i]);
          prefixes.push(undefined);
        }
      }
      continue;
    }

    if (typeof current !== 'object') {
      continue;
    }

    if (seenObjects.has(current)) {
      throw new Error('resolveStyles: circular reference detected.');
    }
    seenObjects.add(current);

    const keys = Object.keys(current);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!key) {
        if (prefix === undefined) {
          warn('Empty property key encountered and skipped.');
        }
        continue;
      }

      const value = (current as StyleObject)[key];
      const fullKey = prefix === undefined ? key : `${prefix}-${key}`;
      const camelKey = toCamelCase(fullKey);

      if (value === null || value === undefined) {
        delete result[camelKey];
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        stack.push(value);
        prefixes.push(fullKey);
        continue;
      }

      if (typeof value === 'string') {
        result[camelKey] = value;
        continue;
      }

      if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
          warn(`Invalid number value for "${fullKey}": ${value}. Skipped.`);
          continue;
        }
        result[camelKey] = addUnit(camelKey, value);
        continue;
      }

      if (typeof value === 'boolean') {
        warn(`Boolean value for "${fullKey}" is not supported and was ignored.`);
      }
    }
  }

  return result;
}

export default resolveStyles;
