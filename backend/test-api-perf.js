const https = require('https');

const API_BASE = 'https://abcbooks.store/api';
const endpoints = [
    '/books',
    '/categories',
    '/books/section/trending',
    '/books/section/new-arrivals',
    '/books/section/best-sellers',
    '/categories/languages',
    '/categories/language/urdu'
];

async function checkEndpoint(endpoint) {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.get(`${API_BASE}${endpoint}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const time = Date.now() - start;
                resolve({ 
                    Endpoint: endpoint, 
                    Status: res.statusCode, 
                    TimeMs: time,
                    Result: res.statusCode >= 200 && res.statusCode < 300 ? 'OK' : 'ERROR', 
                    Details: res.statusCode >= 400 ? data.substring(0, 50) : 'Success'
                });
            });
        }).on('error', (err) => {
            resolve({ Endpoint: endpoint, Status: 'FAIL', TimeMs: Date.now() - start, Result: 'ERROR', Details: err.message });
        });

        req.setTimeout(15000, () => {
            req.destroy(new Error('Timeout'));
        });
    });
}

async function runDiagnostics() {
    console.log(`Starting API Diagnostics for ${API_BASE}...`);
    console.log(`This will check for database cold starts and API health.\n`);
    
    const results = [];
    for (const ep of endpoints) {
        console.log(`Checking ${ep}...`);
        const result = await checkEndpoint(ep);
        results.push(result);
    }
    
    console.log('\n--- API DIAGNOSTIC SUMMARY ---');
    console.log(JSON.stringify(results, null, 2));

    
    // Check for slow loading times
    const slowEndpoints = results.filter(r => r.TimeMs > 2000);
    if (slowEndpoints.length > 0) {
        console.log("\n⚠️ WARNING: SLOW ENDPOINTS DETECTED (>2000ms expected due to Neon Cold Starts)");
    } else {
        console.log("\n✅ API responses are fast.");
    }

    const errorEndpoints = results.filter(r => r.Result === 'ERROR');
    if (errorEndpoints.length > 0) {
         console.log("\n❌ CRITICAL: SOME ENDPOINTS FAILED!");
    } else {
         console.log("\n✅ All endpoints are working!");
    }
}

runDiagnostics();
