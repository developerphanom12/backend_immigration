const jwt = require('jsonwebtoken');
const secretKey = 'secretkey'; 

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized user, please provide a token' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
