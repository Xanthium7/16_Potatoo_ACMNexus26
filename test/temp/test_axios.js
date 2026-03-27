// Import your custom Axios clone
const axios = require('./dareal-axios/index.js');

async function runTests() {
    console.log('🚀 Initiating dareal-axios test sequence...\n');

    try {
        // ---------------------------------------------------------
        // TEST 1: Basic GET Request
        // ---------------------------------------------------------
        console.log('--- Test 1: Fetching data (GET) ---');
        console.log('Target: https://jsonplaceholder.typicode.com/todos/1');

        const getResponse = await axios.get('https://jsonplaceholder.typicode.com/todos/1');

        // Real Axios wraps the response body inside a '.data' property
        console.log('✅ Status Code:', getResponse.status);
        console.log('✅ Response Data:', getResponse.data);
        console.log('\n');

        // ---------------------------------------------------------
        // TEST 2: Sending Data (POST)
        // ---------------------------------------------------------
        console.log('--- Test 2: Submitting data (POST) ---');
        console.log('Target: https://jsonplaceholder.typicode.com/posts');

        const payload = {
            title: 'Testing dareal-axios',
            body: 'It works flawlessly!',
            userId: 99,
        };

        const postResponse = await axios.post('https://jsonplaceholder.typicode.com/posts', payload);

        console.log('✅ Status Code:', postResponse.status);
        console.log('✅ Created Data:', postResponse.data);
        console.log('\n🎉 All core tests passed successfully!');

    } catch (error) {
        console.error('\n❌ A test failed!');

        // Real Axios attaches the response to the error object if the server rejected the request
        if (error.response) {
            console.error('Server responded with status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            // Network error or code bug in the clone itself
            console.error('Error Message:', error.message);
        }
    }
}

// Execute the test runner
runTests();