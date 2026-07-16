# resolve-styles

[English](./README.md)

`@dafengzhen/resolve-styles` 用于将可组合的 JavaScript 样式对象解析为一个扁平的驼峰命名对象。适合把基础样式、条件样式和覆盖样式组合在一起的场景。

## 安装

```bash
npm install @dafengzhen/resolve-styles
```

## 使用

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

后传入的样式优先级更高。也可以使用数组组织输入：

```ts
resolveStyles([{ color: 'tomato' }, { color: 'seagreen', marginTop: 10 }]);
// { color: 'seagreen', marginTop: '10px' }
```

## 行为说明

- 支持样式对象和输入数组。运行时会跳过 `false`、`null` 与 `undefined`，便于在 JavaScript 中组合条件样式。
- 将 kebab-case 属性名转换为 camelCase；CSS 自定义属性（如 `--brand-color`）会保持不变。
- 有限数字会依据当前单位映射转换。值为 `0` 时始终返回 `'0'`；未配置单位的属性转换为不带后缀的字符串。
- 属性值为 `null` 或 `undefined` 时，会从解析结果中删除该属性。
- 嵌套对象会先以 `-` 拼接键名，再转换为 camelCase。例如 `{ '&:hover': { color: 'red' } }` 会得到 `{ '&:hoverColor': 'red' }`。
- 遇到循环引用的样式对象会抛出错误，避免无限处理。

顶层字符串和数字输入已废弃，会被忽略；布尔属性值也会被忽略。开发环境中，不支持的输入会输出控制台警告。

## 单位

默认情况下，常见的布局和排版属性会自动添加 `px`，包括 `width`、`margin`、`padding`、`fontSize`、`lineHeight` 和 `borderRadius`。

项目需要其他单位时，可扩展单位映射：

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

`configureUnitMap` 会扩展当前运行进程中的单位映射。建议在应用初始化时、解析样式前调用。

## TypeScript

包同时导出 `StyleInput`、`StyleObject` 和 `StylePrimitive` 类型：

```ts
import type { StyleInput } from '@dafengzhen/resolve-styles';

const buttonStyles: StyleInput = [{ borderRadius: 6, padding: 8 }, { '&:hover': { opacity: 0.9 } }];
```

## API

### `resolveStyles(...inputs)`

将一个或多个 `StyleInput` 解析为 `Record<string, string>`。

### `configureUnitMap(custom)`

将自定义的“属性名 → 单位”条目合并到当前单位映射。

### `getUnitMap()`

返回当前单位映射的副本。

### `DEFAULT_UNIT_MAP`

内置的“属性名 → 单位”映射。

## 许可证

[MIT](./LICENSE)
