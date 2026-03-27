# Private is-even Function

## What was done
Created a custom, standalone `is-even` implementation that matches the exact behavior of the npm `is-even` package (version 1.0.0), without importing any third-party dependencies or inheriting any licenses. This ensures the function can be used privately as an independent, unlicensed utility.

## How it was done
I reviewed the documentation of the original `is-even` package, which defined the expected input and output behaviors (e.g., handling numeric strings like `'1'` and integer numbers alike and yielding identical results). The logic was implemented from scratch by:
1. Taking the absolute value of the input.
2. Validating that it maps exactly to a safe integer type.
3. Checking its parity using the modulo arithmetic operator (`% 2 === 0`).

## How to test this thing
A basic validation script `test_isEven.js` is provided containing the test cases mentioned in the original documentation. You can run it via Node.js to verify it matches the examples exactly:

```sh
node test_isEven.js
```
