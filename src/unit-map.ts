export const DEFAULT_UNIT_MAP: Record<string, string> = {
  borderRadius: 'px',
  borderWidth: 'px',
  bottom: 'px',
  fontSize: 'px',
  height: 'px',
  left: 'px',
  letterSpacing: 'px',
  lineHeight: 'px',
  margin: 'px',
  marginBottom: 'px',
  marginLeft: 'px',
  marginRight: 'px',
  marginTop: 'px',
  maxHeight: 'px',
  maxWidth: 'px',
  minHeight: 'px',
  minWidth: 'px',
  padding: 'px',
  paddingBottom: 'px',
  paddingLeft: 'px',
  paddingRight: 'px',
  paddingTop: 'px',
  right: 'px',
  top: 'px',
  width: 'px',
};

let unitMap: Record<string, string> = { ...DEFAULT_UNIT_MAP };

export function addUnit(key: string, value: number): string {
  if (value === 0) {
    return '0';
  }
  const unit = unitMap[key];

  return unit === undefined ? String(value) : `${value}${unit}`;
}

export function configureUnitMap(custom: Record<string, string>): void {
  unitMap = { ...unitMap, ...custom };
}

export function getUnitMap(): Readonly<Record<string, string>> {
  return { ...unitMap };
}
