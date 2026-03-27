const isEven = require('./index');

console.log("🧪 Running is-even tests...\n");

// 1. Standard Numbers
console.log("--- Standard Numbers ---");
console.log("4 is even? (Expect true):", isEven(4) === true ? "✅ Pass" : "❌ Fail");
console.log("5 is even? (Expect false):", isEven(5) === false ? "✅ Pass" : "❌ Fail");
console.log("0 is even? (Expect true):", isEven(0) === true ? "✅ Pass" : "❌ Fail");
console.log("-2 is even? (Expect true):", isEven(-2) === true ? "✅ Pass" : "❌ Fail");

// 2. String Numbers (The original npm package supports this)
console.log("\n--- String Numbers ---");
console.log("'8' is even? (Expect true):", isEven("8") === true ? "✅ Pass" : "❌ Fail");
console.log("'-3' is even? (Expect false):", isEven("-3") === false ? "✅ Pass" : "❌ Fail");

// 3. Error Handling (Testing the validation logic)
console.log("\n--- Error Handling (Should throw errors) ---");

// Test decimals
try {
    isEven(4.5);
    console.log("Decimals: ❌ Fail (Did not throw an error)");
} catch (e) {
    console.log("Decimals: ✅ Pass (Threw error as expected ->", e.message + ")");
}

// Test non-number strings
try {
    isEven("hello");
    console.log("Text strings: ❌ Fail (Did not throw an error)");
} catch (e) {
    console.log("Text strings: ✅ Pass (Threw error as expected ->", e.message + ")");
}

// Test booleans
try {
    isEven(true);
    console.log("Booleans: ❌ Fail (Did not throw an error)");
} catch (e) {
    console.log("Booleans: ✅ Pass (Threw error as expected ->", e.message + ")");
}