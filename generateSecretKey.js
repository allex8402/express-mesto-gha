const crypto = require('crypto');

// Генерируем 256-битный (32-байтный) секретный ключ
const secretKey = crypto.randomBytes(32).toString('hex');

console.log('Секретный ключ:', secretKey);