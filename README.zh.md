# resolve-styles

[![GitHub License](https://img.shields.io/github/license/dafengzhen/resolve-styles?color=blue)](https://github.com/dafengzhen/resolve-styles)
[![npm version](https://img.shields.io/npm/v/@dafengzhen/resolve-styles)](https://www.npmjs.com/package/@dafengzhen/resolve-styles)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dafengzhen/resolve-styles/pulls)

[English](./README.md)

将混合样式解析为扁平的驼峰命名对象 — 支持字符串、对象、数组，可覆盖。零依赖。

## 安装

```bash
npm install @dafengzhen/resolve-styles
```

## 快速开始

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

## 特性

- **多种输入类型** — 支持对象、数组和原始值作为样式输入
- **扁平驼峰输出** — 所有属性名自动转换为驼峰命名
- **自动单位转换** — 数值自动添加合适的单位（如 `16` → `'16px'`）
- **数组合并** — 合并数组，最后的元素优先级最高
- **嵌套对象扁平化** — 嵌套选择器以连字符分隔的前缀展平
- **条件样式** — `null` / `undefined` 值会被静默跳过
- **属性移除** — 将属性设为 `null` 可从结果中移除
- **循环引用检测** — 检测到循环引用时抛出错误
- **零依赖** — 无运行时依赖

## API

### `resolveStyles(...inputs: StyleInput[]): Record<string, string>`

接收任意数量的样式输入，返回一个扁平的 `Record<string, string>`，键为驼峰命名，值为 CSS 字符串。

#### 合并优先级

输入按**逆序**处理 — 最后一个输入具有最高优先级。数组中的元素也是最后的元素优先级最高。

```ts
resolveStyles({ color: 'red', fontSize: 14 }, { color: 'blue' }, { fontSize: 18 });
// → { color: 'blue', fontSize: '18px' }
```

#### 数组合并

数组会被展平并合并，后面的元素会覆盖前面的：

```ts
resolveStyles([{ color: 'red' }, { color: 'blue', fontSize: 14 }]);
// → { color: 'blue', fontSize: '14px' }
```

#### 嵌套对象

嵌套对象以连字符分隔的键展平，适用于伪类、媒体查询或嵌套选择器：

```ts
resolveStyles({
  '&:hover': {
    color: 'red',
    backgroundColor: 'blue',
  },
});
// → { '&:hover-color': 'red', '&:hover-backgroundColor': 'blue' }
```

#### 条件样式

假值（`null`、`undefined`、`false`）会被跳过，方便实现条件样式：

```ts
const isActive = false;

resolveStyles({ color: 'red' }, isActive && { color: 'blue' }, { fontSize: 16 });
// → { color: 'red', fontSize: '16px' }
```

#### 属性移除

将属性设为 `null` 可从最终结果中移除该属性：

```ts
resolveStyles({ color: 'red', fontSize: '16px' }, { fontSize: null });
// → { color: 'red' }
```

### `configureUnitMap(custom: Record<string, string>): void`

自定义哪些 CSS 属性会自动添加单位以及使用哪个单位。

```ts
import { configureUnitMap } from '@dafengzhen/resolve-styles';

configureUnitMap({
  myCustomProp: 'rem',
  opacity: '', // 空字符串表示不添加单位
});

resolveStyles({ myCustomProp: 2, opacity: 0.5 });
// → { myCustomProp: '2rem', opacity: '0.5' }
```

### `getUnitMap(): Readonly<Record<string, string>>`

返回当前单位映射表的副本（包括自定义配置）。

### `DEFAULT_UNIT_MAP`

库使用的默认单位映射表。包含常见的 CSS 属性，如 `width`、`height`、`margin`、`padding`、`fontSize`、`borderRadius` 等，均映射为 `'px'`。

## 类型

```ts
export type StyleInput = StyleInput[] | StyleObject | StylePrimitive;

export interface StyleObject {
  [key: string]: StyleInput;
}

export type StylePrimitive = null | number | string | undefined;
```

## License

[MIT](./LICENSE)
