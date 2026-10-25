import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { ResolvedStyles, StyleInput, StyleObject, StyleValue } from './index.js';

import * as publicApi from './index.js';
import { resolveStyles } from './index.js';

describe('resolveStyles', () => {
  it('exposes only the named runtime export', () => {
    expect(Object.keys(publicApi)).toEqual(['resolveStyles']);
    expect(publicApi.resolveStyles).toBe(resolveStyles);
  });

  it('returns a fresh ordinary object for empty inputs', () => {
    const first = resolveStyles(null, undefined, false, []);
    expect(first).toEqual({});
    expect(Object.getPrototypeOf(first)).toBe(Object.prototype);
    expect(resolveStyles()).not.toBe(first);
  });

  it('preserves strings, numeric values, zero and empty strings', () => {
    expect(resolveStyles({ content: '', margin: 0, opacity: 0.5, width: '12px' })).toEqual({
      content: '',
      margin: 0,
      opacity: 0.5,
      width: '12px',
    });
  });

  it('merges arguments and nested arrays in encounter order', () => {
    expect(
      resolveStyles(
        { color: 'red', padding: 1 },
        [null, { color: 'blue' }, [false, undefined, { padding: 2 }]],
        { color: 'green' },
      ),
    ).toEqual({ color: 'green', padding: 2 });
  });

  it('supports readonly inputs and exports useful types', () => {
    const inputs = [{ 'font-size': 16 }, [false, { color: 'red' }]] as const satisfies StyleInput;
    const object = { color: 'blue' } as const satisfies StyleObject;
    const result = resolveStyles(inputs, object);
    expect(result).toEqual({ color: 'blue', fontSize: 16 });
    expectTypeOf(result).toEqualTypeOf<ResolvedStyles>();
    expectTypeOf<StyleValue>().toEqualTypeOf<number | string>();

    // @ts-expect-error Top-level CSS strings are not style inputs.
    const invalidInput: StyleInput = 'color: red';
    // @ts-expect-error Nested selectors are not inline declarations.
    const invalidObject: StyleObject = { '&:hover': { color: 'red' } };
    // @ts-expect-error Boolean declarations are not CSS values.
    const invalidValue: StyleObject = { color: false };
    void [invalidInput, invalidObject, invalidValue];
  });

  it('normalizes CSS names and vendor prefixes but preserves custom properties', () => {
    expect(
      resolveStyles({
        '--Brand-color': 'red',
        '-moz-appearance': 'none',
        '-ms-transform': 'none',
        '-webkit-transform': 'none',
        'background-color': 'black',
        ' font-size ': 16,
        lineHeight: 1.5,
      }),
    ).toEqual({
      '--Brand-color': 'red',
      backgroundColor: 'black',
      fontSize: 16,
      lineHeight: 1.5,
      MozAppearance: 'none',
      msTransform: 'none',
      WebkitTransform: 'none',
    });
  });

  it('applies overrides and deletion after property normalization', () => {
    expect(
      resolveStyles(
        { 'background-color': 'red', 'font-size': 12, opacity: 1 },
        { backgroundColor: 'blue', fontSize: null, opacity: undefined },
      ),
    ).toEqual({ backgroundColor: 'blue', opacity: 1 });
    expect(resolveStyles({ color: 'red' }, { color: null }, { color: 'green' })).toEqual({
      color: 'green',
    });
    expect(resolveStyles({ absent: null, color: undefined })).toEqual({});
  });

  it('resolves alternate spellings in own property order', () => {
    const input: StyleObject = Object.fromEntries([
      ['fontSize', 12],
      ['font-size', 16],
    ]);
    expect(resolveStyles(input)).toEqual({ fontSize: 16 });
  });

  it('does not modify frozen inputs or share result objects', () => {
    const input = Object.freeze({ 'font-size': 16 });
    const array = Object.freeze([input]);
    const first = resolveStyles(array);
    first.fontSize = 24;
    expect(resolveStyles(array)).toEqual({ fontSize: 16 });
    expect(input).toEqual({ 'font-size': 16 });
  });

  it('accepts shared objects and arrays without treating them as cycles', () => {
    const shared = { color: 'red' };
    const array = [shared];
    expect(resolveStyles(shared, { color: 'blue' }, shared)).toEqual(shared);
    expect(resolveStyles(array, { color: 'blue' }, array, [array])).toEqual(shared);
  });

  it('rejects direct and indirect circular arrays', () => {
    const direct: StyleInput[] = [];
    direct.push(direct);
    expect(() => resolveStyles(direct)).toThrow(/circular style array/);
    const first: StyleInput[] = [];
    const second: StyleInput[] = [first];
    first.push(second);
    expect(() => resolveStyles(first)).toThrow(TypeError);
    expect(resolveStyles({ color: 'red' })).toEqual({ color: 'red' });
  });

  it('handles deep and large arrays without a recursion or iteration limit', () => {
    let deep: StyleInput = { color: 'red' };
    for (let index = 0; index < 20_000; index++) {
      deep = [deep];
    }
    expect(resolveStyles(deep)).toEqual({ color: 'red' });
    expect(resolveStyles(Array.from({ length: 20_000 }, () => ({ opacity: 1 })))).toEqual({
      opacity: 1,
    });
  });

  it('skips sparse array entries', () => {
    const sparse: StyleInput[] = [];
    sparse.length = 3;
    sparse[1] = { color: 'red' };
    expect(resolveStyles(sparse)).toEqual({ color: 'red' });
  });

  it('reads only own enumerable string properties and accepts null prototypes', () => {
    const input: StyleObject = Object.create(null);
    Object.defineProperties(input, {
      color: { enumerable: true, value: 'red' },
      hidden: { value: 'ignored' },
      [Symbol('hidden')]: { enumerable: true, value: 'ignored' },
    });
    expect(resolveStyles(input)).toEqual({ color: 'red' });
  });

  it('handles prototype-sensitive keys as ordinary own properties', () => {
    const input: StyleObject = JSON.parse(
      '{"__proto__":"safe","constructor":"own","toString":"own"}',
    );
    const result = resolveStyles(input);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(result['__proto__']).toBe('safe');
    expect(result['constructor']).toBe('own');
    expect(result['toString']).toBe('own');
    expect(resolveStyles(input, JSON.parse('{"__proto__":null}'))).toEqual({
      constructor: 'own',
      toString: 'own',
    });
  });

  it.each(['color: red', '', 0, 1, true, () => {}, Symbol('style'), 1n])(
    'rejects invalid top-level input %s',
    (input) => {
      expect(() => resolveStyles(input as StyleInput)).toThrow(TypeError);
      expect(() => resolveStyles([input as StyleInput])).toThrow(TypeError);
    },
  );

  it.each([new Date(), new Map(), new Set(), /style/, new (class Style {})()])(
    'rejects non-plain objects %s',
    (input) => {
      expect(() => resolveStyles(input as StyleInput)).toThrow(/plain style object/);
    },
  );

  it.each([false, true, NaN, Infinity, -Infinity, {}, [], () => {}, Symbol('value'), 1n])(
    'rejects invalid declaration value %s',
    (value) => {
      expect(() => resolveStyles({ color: value } as unknown as StyleObject)).toThrow(
        /"color" must be/,
      );
    },
  );

  it.each(['', '  ', '\t\n'])('rejects blank property names %j', (property) => {
    expect(() => resolveStyles({ [property]: 'red' })).toThrow(/must not be empty/);
  });

  it('never emits warnings for valid or invalid input', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      resolveStyles(false, { color: 'red' });
      expect(() => resolveStyles('color: red' as unknown as StyleInput)).toThrow(TypeError);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
