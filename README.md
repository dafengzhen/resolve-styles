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
  fontSize: 16,
  height: 50,
  margin: 0,
  padding: 10,
  width: 100,
});

console.log(styles);
// {
//   color: 'red',
//   fontSize: '16px',
//   height: '50px',
//   margin: '0',
//   padding: '10px',
//   width: '100px'
// }
```

## Features

- **Multiple input types** — accept objects, arrays, and primitives as style inputs
- **Flat camelCased output** — all property names are converted to camelCase
- **Automatic unit conversion** — numeric values get appropriate units (e.g., `16` → `'16px'`)
- **Array composition** — merge arrays with last-element-wins precedence
- **Nested object flattening** — nested selectors are flattened with hyphen-separated prefixes
- **Conditional styles** — `null` / `undefined` values are silently skipped
- **Property removal** — set a property to `null` to remove it from the result
- **Circular reference detection** — throws on circular structures
- **Zero dependencies** — no runtime dependencies

## API

### `resolveStyles(...inputs: StyleInput[]): Record<string, string>`

Takes any number of style inputs and returns a flat `Record<string, string>` with camelCased keys and string CSS values.

#### Merge Precedence

Inputs are processed in **reverse order** — the last input has the highest precedence. Arrays are flattened with their last element having the highest precedence.

```ts
resolveStyles({ color: 'red', fontSize: 14 }, { color: 'blue' }, { fontSize: 18 });
// → { color: 'blue', fontSize: '18px' }
```

#### Array Composition

Arrays are flattened and merged. Later elements override earlier ones:

```ts
resolveStyles([{ color: 'red' }, { color: 'blue', fontSize: 14 }]);
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

resolveStyles({ color: 'red' }, isActive && { color: 'blue' }, { fontSize: 16 });
// → { color: 'red', fontSize: '16px' }
```

#### Property Removal

Set a property to `null` to remove it from the final result:

```ts
resolveStyles({ color: 'red', fontSize: '16px' }, { fontSize: null });
// → { color: 'red' }
```

### `configureUnitMap(custom: Record<string, string>): void`

Customize which CSS properties receive automatic units and which unit to use.

```ts
import { configureUnitMap } from '@dafengzhen/resolve-styles';

configureUnitMap({
  myCustomProp: 'rem',
  opacity: '', // empty string means no unit
});

resolveStyles({ myCustomProp: 2, opacity: 0.5 });
// → { myCustomProp: '2rem', opacity: '0.5' }
```

### `getUnitMap(): Readonly<Record<string, string>>`

Returns a copy of the current unit map (including any customizations).

### `DEFAULT_UNIT_MAP`

The default unit map used by the library. Contains common CSS properties like `width`, `height`, `margin`, `padding`, `fontSize`, `borderRadius`, etc., all mapped to `'px'`.

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
