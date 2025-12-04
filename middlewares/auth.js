const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  // Try Authorization header first, then cookies
  const authHeader = req.headers.authorization || (req.cookies && req.cookies.Authorization);
  let token = null;

  if (authHeader && typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    else token = authHeader;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
