const baseUrl = 'https://www.abcbooks.store/api';

async function testApi() {
  console.log('Running comprehensive API tests on ' + baseUrl + '...\n');

  const tests = [
    { method: 'GET', path: '/health', expectContains: '"status":"ok"' },
    { method: 'GET', path: '/books', expectContains: '"books":[' },
    { method: 'GET', path: '/categories', expectContains: '"categories":[' },
    { method: 'GET', path: '/books/section/hero', expectContains: '"books":[' },
    { method: 'POST', path: '/auth/login', body: { email: 'fake@email.com', password: 'badpassword' }, expectContains: 'Invalid', expectCode: 401 }
  ];

  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      console.log(`Testing ${test.method} ${test.path}...`);
      const response = await fetch(baseUrl + test.path, options);
      const text = await response.text();
      
      const isSuccess = text.includes(test.expectContains) && (!test.expectCode || response.status === test.expectCode);
      if (isSuccess) {
        console.log(`✅ SUCCESS - (Status ${response.status})`);
      } else {
        console.log(`❌ FAILED - Expected to contain '${test.expectContains}', got:`);
        console.log(text.substring(0, 100));
      }
    } catch (e) {
      console.log(`❌ ERROR: ${e.message}`);
    }
  }
}

testApi();
