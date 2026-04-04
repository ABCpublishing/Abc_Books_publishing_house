const http = require('http');
const app = require('./api/index.js');

const server = http.createServer((req, res) => {
  app(req, res);
});

server.listen(3002, () => {
  console.log('Test server running on port 3002');
});
