import { toCamelCase } from './camel-case.js';
import { warn } from './warn.js';

export function parseStyleString(css: string, result: Record<string, string>): void {
  let i = 0;
  const len = css.length;

  while (i < len) {
    while (
      i < len &&
      (css[i] === ' ' || css[i] === '\t' || css[i] === '\n' || css[i] === '\r' || css[i] === ';')
    ) {
      i++;
    }
    if (i >= len) {
      break;
    }

    const keyStart = i;
    while (i < len && css[i] !== ':') {
      i++;
    }
    if (i >= len) {
      break;
    }
    i++;

    const valueStart = i;
    let valueEnd = -1;
    let quote = '';
    let parens = 0;
    while (i < len) {
      const ch = css[i];

      if (quote) {
        if (ch === quote) {
          quote = '';
        }
        i++;
        continue;
      }

      if (ch === '"' || ch === "'") {
        quote = ch;
        i++;
        continue;
      }

      if (ch === '(') {
        parens++;
        i++;
        continue;
      }

      if (ch === ')') {
        parens--;
        i++;
        continue;
      }

      if (ch === ';' && parens === 0) {
        valueEnd = i;
        i++;
        break;
      }

      i++;
    }

    if (valueEnd === -1) {
      valueEnd = len;
    }

    const trimmedKey = css.slice(keyStart, valueStart - 1).trim();
    const trimmedValue = css.slice(valueStart, valueEnd).trim();

    if (trimmedKey && trimmedValue) {
      result[toCamelCase(trimmedKey)] = trimmedValue;
    } else if (trimmedKey && !trimmedValue) {
      warn(`Empty value for property "${trimmedKey}" ignored.`);
    }
  }
}
