const jwt = require('jsonwebtoken');

// Make sure this secret key matches the one in server.js
const JWT_SECRET = 'stockscan360_secret_key_123';

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next(); // <--- This needs 'next' defined above
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};