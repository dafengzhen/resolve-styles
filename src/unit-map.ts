export const DEFAULT_UNIT_MAP: Record<string, string> = {
  width: 'px',
  height: 'px',
  minWidth: 'px',
  minHeight: 'px',
  maxWidth: 'px',
  maxHeight: 'px',
  top: 'px',
  right: 'px',
  bottom: 'px',
  left: 'px',
  margin: 'px',
  marginTop: 'px',
  marginRight: 'px',
  marginBottom: 'px',
  marginLeft: 'px',
  padding: 'px',
  paddingTop: 'px',
  paddingRight: 'px',
  paddingBottom: 'px',
  paddingLeft: 'px',
  fontSize: 'px',
  lineHeight: 'px',
  letterSpacing: 'px',
  borderRadius: 'px',
  borderWidth: 'px',
};

let unitMap: Record<string, string> = { ...DEFAULT_UNIT_MAP };

export function configureUnitMap(custom: Record<string, string>): void {
  unitMap = { ...unitMap, ...custom };
}

export function getUnitMap(): Readonly<Record<string, string>> {
  return { ...unitMap };
}

export function addUnit(key: string, value: number): string {
  if (value === 0) {
    return '0';
  }
  const unit = unitMap[key];

  return unit === undefined ? String(value) : `${value}${unit}`;
}
