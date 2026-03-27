function isEven(value) {
  const n = Math.abs(value);
  if (!Number.isInteger(n)) {
    throw new TypeError('expected an integer');
  }
  if (!Number.isSafeInteger(n)) {
    throw new Error('value exceeds maximum safe integer');
  }
  return (n % 2) === 0;
}
module.exports = isEven;
