import { resolveStyles } from '../src/index.js';

const styles = resolveStyles({ 'background-color': '#eef2ff', color: '#3730a3', padding: '16px' }, [
  { 'border-radius': '8px' },
  false,
  { 'font-weight': 600 },
]);

const output = document.querySelector<HTMLElement>('#output')!;
Object.assign(output.style, styles);
output.textContent = JSON.stringify(styles, null, 2);
