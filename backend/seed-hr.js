const http = require('http');

const data = JSON.stringify({
    firstName: 'Satya',
    lastName: 'Nadella',
    email: 'hr@microsoft.com',
    password: 'Password123!',
    role: 'company_admin'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
