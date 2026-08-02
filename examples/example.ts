import resolveStyles from '../src/index.ts';

const baseStyles = resolveStyles({
  color: 'red',
  fontSize: 16,
  height: 50,
  margin: 0,
  padding: 10,
  width: 100,
});

console.log('Basic style:', baseStyles);
