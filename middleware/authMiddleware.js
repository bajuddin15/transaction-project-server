const {verifyToken} = require('../utils/jwtToken')

// Middleware to authenticate requests
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      return res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = {authenticate}