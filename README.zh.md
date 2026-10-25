# resolve-styles

[![GitHub License](https://img.shields.io/github/license/dafengzhen/resolve-styles?color=blue)](https://github.com/dafengzhen/resolve-styles)
[![npm version](https://img.shields.io/npm/v/@dafengzhen/resolve-styles)](https://www.npmjs.com/package/@dafengzhen/resolve-styles)

[English](./README.md)

组合内联样式对象，提供明确的覆盖规则，零运行时依赖。

## 安装

```bash
npm install @dafengzhen/resolve-styles
```

## 快速开始

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

同时提供默认导出。支持只读对象和数组，可以直接传入 `as const` 定义。

## API

### `resolveStyles(...inputs: readonly StyleInput[]): ResolvedStyles`

返回一个全新、可修改的普通对象，不修改输入。参数、嵌套数组和对象自身的可枚举字符串属性均从左到右处理；属性名归一化后，后面的声明覆盖前面的声明。支持重复使用同一个对象或数组。

| 输入                                             | 行为             |
| ------------------------------------------------ | ---------------- |
| 普通样式对象，包括原型为 `null` 的对象           | 合并属性         |
| 嵌套的样式输入数组                               | 按顺序组合       |
| 作为输入的 `false`、`null`、`undefined`          | 跳过             |
| 其他输入，包括 CSS 字符串、数值、`true` 和类实例 | 抛出 `TypeError` |

| 属性值                                 | 行为               |
| -------------------------------------- | ------------------ |
| 字符串或有限数值                       | 保留原值和类型     |
| `null`                                 | 删除归一化后的属性 |
| `undefined`                            | 保留之前的值       |
| 布尔值、对象、数组、非有限数值或其他值 | 抛出 `TypeError`   |

```ts
resolveStyles(
  { color: 'red', 'font-size': '14px', opacity: 0.5 },
  { color: undefined, fontSize: null, opacity: 0 },
);
// { color: 'red', opacity: 0 }
```

数值保持为数值。本库不自动添加单位，也不负责将结果应用到元素。使用方需要单位时，请传入 `'16px'` 等字符串。传给 React 的 `style` 属性时，数值遵循 React 自身的单位规则；赋值给 `element.style` 时，需要自行提供带单位的字符串。

### 属性名

属性名会去除首尾空白，再从短横线命名转换为 JavaScript 样式属性名。CSS 自定义属性保留原有拼写和大小写。空白属性名会抛出 `TypeError`。

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

本库用于组合扁平内联样式，不支持嵌套选择器、媒体查询、属性值数组或原始 CSS 文本。不验证 CSS 属性名、不解析 CSS 语法，也不展开简写属性；例如，`margin` 和 `marginLeft` 会保留为两个独立条目。

循环数组会抛出 `TypeError`。遍历使用迭代方式，不设固定深度或输入数量上限。无效值立即报错，无效属性值的错误信息中包含属性名。本库不输出任何警告日志。

## 类型

```ts
export type StyleValue = number | string;

export interface StyleObject {
  readonly [property: string]: null | StyleValue | undefined;
}

export type StyleInput = false | null | readonly StyleInput[] | StyleObject | undefined;
export type ResolvedStyles = Record<string, StyleValue>;
```

## 开发

```bash
npm run check         # 类型、lint、格式、测试、构建与包校验
npm run coverage      # 覆盖率报告
npm run dev           # 示例页面
```

## License

[MIT](./LICENSE)
