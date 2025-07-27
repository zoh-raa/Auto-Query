const jwt = require('jsonwebtoken');

const payload = {
  _id: '1', // Replace with a real user ID from your `customers` collection
  name: 'Tyra',
  email: 'tyrachubzoo@gmail.com'
};

const secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxIiwibmFtZSI6IlR5cmEiLCJlbWFpbCI6InR5cmFjaHViem9vQGdtYWlsLmNvbSIsImlhdCI6MTc1MjgwNDg3NywiZXhwIjoxNzUyODkxMjc3fQ.8Z9glLa7QZWmyce4PVhnnZY4bZwx6sBitkY6cs0QP6c'; // Replace this with your actual JWT secret from `.env`

const token = jwt.sign(payload, secret, { expiresIn: '1d' });

console.log("Generated Token:");
console.log(token);
