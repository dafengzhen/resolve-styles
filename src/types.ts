export type StylePrimitive = string | number | null | undefined;

export interface StyleObject {
  [key: string]: StyleInput;
}

export type StyleInput = StylePrimitive | StyleObject | StyleInput[];
