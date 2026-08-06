# resolve-styles

[![GitHub License](https://img.shields.io/github/license/dafengzhen/resolve-styles?color=blue)](https://github.com/dafengzhen/resolve-styles)
[![npm version](https://img.shields.io/npm/v/@dafengzhen/resolve-styles)](https://www.npmjs.com/package/@dafengzhen/resolve-styles)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dafengzhen/resolve-styles/pulls)

[简体中文](./README.zh.md)

Parse mixed styles into a flat camelCased object — strings, objects, arrays, with override. Zero dependencies.

## Installation

```bash
npm install @dafengzhen/resolve-styles
```

## Quick Start

```ts
import resolveStyles from '@dafengzhen/resolve-styles';

const styles = resolveStyles({
  color: 'red',
  fontSize: '16px',
  height: '50px',
  margin: '0px',
  padding: '10px',
  width: '100px',
});

console.log(styles);
// {
//   color: 'red',
//   fontSize: '16px',
//   height: '50px',
//   margin: '0px',
//   padding: '10px',
//   width: '100px'
// }
```

> **Note:** Numeric values are converted to plain strings without automatic unit suffixes. Use explicit string values for CSS units (e.g., `'16px'` instead of `16`).

## Features

- **Multiple input types** — accept objects, arrays, and primitives as style inputs
- **Flat camelCased output** — all property names are converted to camelCase
- **Array composition** — merge arrays with last-element-wins precedence
- **Nested object flattening** — nested selectors are flattened with hyphen-separated prefixes
- **Conditional styles** — `null` / `undefined` / `false` values are silently skipped
- **Property removal** — set a property to `null` to remove it from the result
- **Circular reference detection** — throws on circular structures
- **Boolean values** — warned and ignored
- **Iteration guard** — enforces a maximum iteration limit to prevent infinite loops
- **Zero dependencies** — no runtime dependencies

## API

### `resolveStyles(...inputs: StyleInput[]): Record<string, string>`

Takes any number of style inputs and returns a flat `Record<string, string>` with camelCased keys and string CSS values.

#### Merge Precedence

Inputs are processed in **reverse order** — the last input has the highest precedence. Arrays are flattened with their last element having the highest precedence.

```ts
resolveStyles({ color: 'red', fontSize: '14px' }, { color: 'blue' }, { fontSize: '18px' });
// → { color: 'blue', fontSize: '18px' }
```

#### Array Composition

Arrays are flattened and merged. Later elements override earlier ones:

```ts
resolveStyles([{ color: 'red' }, { color: 'blue', fontSize: '14px' }]);
// → { color: 'blue', fontSize: '14px' }
```

#### Nested Objects

Nested objects are flattened with hyphen-separated keys, useful for pseudo-classes, media queries, or nested selectors:

```ts
resolveStyles({
  '&:hover': {
    color: 'red',
    backgroundColor: 'blue',
  },
});
// → { '&:hover-color': 'red', '&:hover-backgroundColor': 'blue' }
```

#### Conditional Styles

Falsy values (`null`, `undefined`, `false`) are skipped, enabling conditional style inclusion:

```ts
const isActive = false;

resolveStyles({ color: 'red' }, isActive && { color: 'blue' }, { fontSize: '16px' });
// → { color: 'red', fontSize: '16px' }
```

#### Property Removal

Set a property to `null` to remove it from the final result:

```ts
resolveStyles({ color: 'red', fontSize: '16px' }, { fontSize: null });
// → { color: 'red' }
```

#### Deprecated Inputs

Passing a raw `string` or `number` as a top-level input is deprecated and will emit a warning. Use object syntax instead.

## Types

```ts
export type StyleInput = StyleInput[] | StyleObject | StylePrimitive;

export interface StyleObject {
  [key: string]: StyleInput;
}

export type StylePrimitive = null | number | string | undefined;
```

## License

[MIT](./LICENSE)
