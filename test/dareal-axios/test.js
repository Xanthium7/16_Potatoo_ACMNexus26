const axios = require('./index.js');

async function testAxios() {
  try {
    console.log('Testing GET request...');
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    console.log('\nTesting POST request...');
    const postResponse = await axios.post('https://jsonplaceholder.typicode.com/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1,
    });
    console.log('Status:', postResponse.status);
    console.log('Data:', postResponse.data);
    
    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testAxios();
