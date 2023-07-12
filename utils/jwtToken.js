const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Generate JWT Token
const generateToken = (userId)=>{
    const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '3d' });
    return token;
}

// Verify JWT Token
const verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error(error);
      return error;
    }
}

module.exports = {generateToken, verifyToken}

