
const jwt = require('jsonwebtoken');

const checkLogin = (req, res, next) => {
  const {authorization}=req.headers;
  const token=authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.token=decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports =checkLogin
