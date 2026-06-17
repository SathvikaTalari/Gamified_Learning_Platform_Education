const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let b = '';
  res.on('data', d => b += d);
  res.on('end', () => console.log(b));
});
req.write(JSON.stringify({username: 'arjun', password: 'demo123'}));
req.end();
