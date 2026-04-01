const http = require('http');

http.get('http://localhost:5001/api/missoes/next-os', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
}).on('error', (err) => {
  console.log('ERROR:', err.message);
});
