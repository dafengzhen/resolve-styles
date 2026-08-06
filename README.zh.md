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

> **注意：** 数值会被转换为纯字符串，不会自动添加单位后缀。请使用显式字符串值来指定 CSS 单位（例如，使用 `'16px'` 而不是 `16`）。

## 特性

- **多种输入类型** — 支持对象、数组和原始值作为样式输入
- **扁平驼峰输出** — 所有属性名自动转换为驼峰命名
- **数组合并** — 合并数组，最后的元素优先级最高
- **嵌套对象扁平化** — 嵌套选择器以连字符分隔的前缀展平
- **条件样式** — `null` / `undefined` / `false` 值会被静默跳过
- **属性移除** — 将属性设为 `null` 可从结果中移除
- **循环引用检测** — 检测到循环引用时抛出错误
- **布尔值处理** — 发出警告并忽略
- **迭代保护** — 强制最大迭代次数以防止无限循环
- **零依赖** — 无运行时依赖

## API

### `resolveStyles(...inputs: StyleInput[]): Record<string, string>`

接收任意数量的样式输入，返回一个扁平的 `Record<string, string>`，键为驼峰命名，值为 CSS 字符串。

#### 合并优先级

输入按**逆序**处理 — 最后一个输入具有最高优先级。数组中的元素也是最后的元素优先级最高。

```ts
resolveStyles({ color: 'red', fontSize: '14px' }, { color: 'blue' }, { fontSize: '18px' });
// → { color: 'blue', fontSize: '18px' }
```

#### 数组合并

数组会被展平并合并，后面的元素会覆盖前面的：

```ts
resolveStyles([{ color: 'red' }, { color: 'blue', fontSize: '14px' }]);
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

resolveStyles({ color: 'red' }, isActive && { color: 'blue' }, { fontSize: '16px' });
// → { color: 'red', fontSize: '16px' }
```

#### 属性移除

将属性设为 `null` 可从最终结果中移除该属性：

```ts
resolveStyles({ color: 'red', fontSize: '16px' }, { fontSize: null });
// → { color: 'red' }
```

#### 已废弃的输入

将原始 `string` 或 `number` 作为顶层输入已被废弃，会产生警告。请改用对象语法。

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
