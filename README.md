# resolve-styles

[中文文档](./README.zh.md)

`@dafengzhen/resolve-styles` resolves composable JavaScript style objects into one flat, camel-cased object. It is useful when styles are assembled from base, conditional, and overriding values.

## Installation

```bash
npm install @dafengzhen/resolve-styles
```

## Usage

```ts
import resolveStyles from '@dafengzhen/resolve-styles';

const isActive = true;

const styles = resolveStyles(
  { color: 'slategray', 'font-size': 14, padding: 8 },
  isActive && { color: 'royalblue' },
  { padding: 12 },
);

// {
//   color: 'royalblue',
//   fontSize: '14px',
//   padding: '12px',
// }
```

Later inputs take precedence. Inputs may also be grouped in arrays:

```ts
resolveStyles([{ color: 'tomato' }, { color: 'seagreen', marginTop: 10 }]);
// { color: 'seagreen', marginTop: '10px' }
```

## Behavior

- Accepts style objects and arrays of inputs. At runtime, `false`, `null`, and `undefined` inputs are skipped, which is useful when composing conditional styles in JavaScript.
- Converts kebab-case property names to camelCase. CSS custom properties such as `--brand-color` are preserved.
- Converts finite numeric values using the configured unit map. A value of `0` always remains `'0'`; properties without a configured unit become strings without a suffix.
- A `null` or `undefined` property value removes that property from the resolved result.
- Flattens nested objects by joining their keys with `-` before camel-casing. For example, `{ '&:hover': { color: 'red' } }` becomes `{ '&:hoverColor': 'red' }`.
- Rejects circular style-object references to prevent an infinite loop.

Top-level string and number inputs are deprecated and ignored. Boolean property values are ignored. In development, unsupported inputs emit a console warning.

## Units

By default, common layout and typography properties receive `px`, including `width`, `margin`, `padding`, `fontSize`, `lineHeight`, and `borderRadius`.

Customize or extend this map when your project uses other units:

```ts
import { configureUnitMap, getUnitMap, resolveStyles } from '@dafengzhen/resolve-styles';

configureUnitMap({
  animationDuration: 'ms',
  rotate: 'deg',
});

resolveStyles({ animationDuration: 200, rotate: 45 });
// { animationDuration: '200ms', rotate: '45deg' }

console.log(getUnitMap());
```

`configureUnitMap` extends the current map for the running process. Call it during application setup before resolving styles.

## TypeScript

The package exports `StyleInput`, `StyleObject`, and `StylePrimitive` types:

```ts
import type { StyleInput } from '@dafengzhen/resolve-styles';

const buttonStyles: StyleInput = [{ borderRadius: 6, padding: 8 }, { '&:hover': { opacity: 0.9 } }];
```

## API

### `resolveStyles(...inputs)`

Resolves one or more `StyleInput` values to `Record<string, string>`.

### `configureUnitMap(custom)`

Merges custom property-to-unit entries into the current unit map.

### `getUnitMap()`

Returns a copy of the current unit map.

### `DEFAULT_UNIT_MAP`

The built-in property-to-unit map.

## License

[MIT](./LICENSE)
