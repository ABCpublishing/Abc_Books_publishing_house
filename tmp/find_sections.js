
const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const regex = /id="([^"]+Books|[^"]+Grid)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(match[1]);
}
const headers = content.match(/<h2>.*?<\/h2>/g);
if (headers) {
    console.log('--- Headers ---');
    headers.forEach(h => console.log(h));
}
