import resolveStyles from '../src/index.ts';

const baseStyles = resolveStyles({
  color: 'red',
  fontSize: 16,
  padding: 10,
  margin: 0,
  width: 100,
  height: 50,
});

console.log('Basic style:', baseStyles);
