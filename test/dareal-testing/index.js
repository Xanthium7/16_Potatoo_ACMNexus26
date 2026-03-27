/**
 * @file index.js
 * @description Clean room implementation of the 'is-even' package.
 *              Determines if a given input value represents an even integer,
 *              supporting direct numbers and string coercions.
 *              This implementation adheres strictly to the provided functional specification.
 */

/**
 * Checks if the provided value is an even integer.
 * It supports direct number inputs and string representations of numbers,
 * attempting to coerce string inputs into numeric types for evaluation.
 * 
 * @param {number | string} value - The value to be checked for evenness.
 *                                  This can be a numeric literal or a string that can be parsed as a number.
 * @returns {boolean} - Returns `true` if the `value` is an even integer (or can be successfully
 *                      coerced from a string into an even integer), otherwise returns `false`.
 */
function isEven(value) {
  // 1. Handle non-number and non-string types as per specification's edge cases
  //    (e.g., null, undefined, objects, arrays, booleans).
  //    'typeof null' is 'object', 'typeof undefined' is 'undefined'.
  //    These should return false immediately.
  if (typeof value !== 'number' && typeof value !== 'string') {
    return false;
  }

  let num;
  if (typeof value === 'string') {
    // 2. Special handling for empty or whitespace-only strings.
    //    The specification states: "Empty string '': Returns `false`."
    if (value.trim() === '') {
      return false;
    }
    // 3. Attempt to coerce the string to a number.
    num = Number(value);
  } else { // value is already a number
    num = value;
  }

  // 4. Validate the coerced number:
  //    - `NaN`: Returns `false`.
  //    - `Infinity` (positive and negative): Returns `false`.
  //    - Floating-point numbers that are not integers (e.g., `2.5`, `-1.7`): Returns `false`.
  //    Number.isFinite covers Infinity/-Infinity and non-numeric values like 'hello' (which become NaN).
  //    Number.isNaN specifically checks for NaN.
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return false;
  }

  // 5. Ensure the number is an integer.
  //    This handles cases like 2.5, -1.7, which are finite but not integers.
  if (!Number.isInteger(num)) {
    return false;
  }

  // 6. Finally, check if the valid integer is even.
  //    The modulo operator (%) works correctly for negative integers in JavaScript
  //    (e.g., -2 % 2 is 0, -1 % 2 is -1).
  return num % 2 === 0;
}

// Export the isEven function as the default export.
module.exports = isEven;
