# resolve-styles

[![GitHub License](https://img.shields.io/github/license/dafengzhen/resolve-styles?color=blue)](https://github.com/dafengzhen/resolve-styles)
[![npm version](https://img.shields.io/npm/v/@dafengzhen/resolve-styles)](https://www.npmjs.com/package/@dafengzhen/resolve-styles)

[简体中文](./README.zh.md)

Compose inline style objects with predictable overrides. Zero runtime dependencies.

## Installation

```bash
npm install @dafengzhen/resolve-styles
```

## Quick start

```ts
import { resolveStyles } from '@dafengzhen/resolve-styles';

const active = true;
const styles = resolveStyles(
  { 'background-color': 'white', color: 'black', opacity: 0.5 },
  active && { color: 'blue' },
  [{ 'font-size': '16px' }, null, { opacity: 1 }],
);
// { backgroundColor: 'white', color: 'blue', opacity: 1, fontSize: '16px' }
```

Only the named `resolveStyles` export is available. Inputs can be readonly objects and arrays, including `as const` definitions.

## API

### `resolveStyles(...inputs: readonly StyleInput[]): ResolvedStyles`

Returns a fresh, mutable, ordinary object. Inputs are never modified. Arguments, nested arrays and own enumerable string properties are processed from left to right; the last declaration for a normalized property wins. Shared objects and arrays can be reused.

| Input                                                                    | Behavior           |
| ------------------------------------------------------------------------ | ------------------ |
| Plain style object, including a null-prototype object                    | Merge declarations |
| Nested array of style inputs                                             | Compose in order   |
| `false`, `null`, `undefined` as an input                                 | Skip               |
| Other inputs, including CSS strings, numbers, `true` and class instances | Throw `TypeError`  |

| Property value                                           | Behavior                        |
| -------------------------------------------------------- | ------------------------------- |
| String or finite number                                  | Preserve the value and its type |
| `null`                                                   | Delete the normalized property  |
| `undefined`                                              | Keep the previous value         |
| Boolean, object, array, non-finite number or other value | Throw `TypeError`               |

```ts
resolveStyles(
  { color: 'red', 'font-size': '14px', opacity: 0.5 },
  { color: undefined, fontSize: null, opacity: 0 },
);
// { color: 'red', opacity: 0 }
```

Numbers stay numbers. This library neither appends units nor applies the result to an element. Use explicit strings such as `'16px'` when the consumer needs units. For React's `style` prop, numeric values follow React's own unit rules; when assigning to `element.style`, supply unit-bearing strings yourself.

### Property names

Property names are trimmed and converted from kebab-case to JavaScript style names. CSS custom properties retain their spelling and case. Blank names throw `TypeError`.

```ts
resolveStyles({
  '--Brand-color': 'blue',
  '-ms-transform': 'none',
  '-webkit-appearance': 'none',
  'background-color': 'white',
});
// {
//   '--Brand-color': 'blue',
//   msTransform: 'none',
//   WebkitAppearance: 'none',
//   backgroundColor: 'white',
// }
```

This is a flat inline-style composer. Nested selectors, media queries, declaration arrays and raw CSS text are unsupported. It does not validate CSS property names, parse CSS syntax or expand shorthand properties; for example, `margin` and `marginLeft` remain separate entries.

Circular arrays throw `TypeError`. Traversal is iterative with no fixed depth or input-count limit. Invalid values throw immediately, with the property name included for invalid declarations. The library never logs warnings.

## Types

```ts
export type StyleValue = number | string;

export interface StyleObject {
  readonly [property: string]: null | StyleValue | undefined;
}

export type StyleInput = false | null | readonly StyleInput[] | StyleObject | undefined;
export type ResolvedStyles = Record<string, StyleValue>;
```

## Breaking changes

This API replaces the previous behavior without a compatibility layer:

- Numeric values are preserved instead of converted to strings.
- `undefined` declarations are skipped; use `null` to delete a property.
- Nested property objects are rejected instead of flattened into prefixed keys.
- Unsupported inputs and invalid declarations throw instead of being ignored or warned about.
- `StylePrimitive` is replaced by the separate `StyleValue` and `StyleInput` types.

## Development

```bash
npm run check         # types, lint, formatting, tests, builds and package validation
npm run coverage      # coverage report
npm run dev           # example playground
```

## License

[MIT](./LICENSE)
