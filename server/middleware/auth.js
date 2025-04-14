const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate users using JWT
 */
exports.authenticate = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user from token payload
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

/**
 * Middleware to check if user is admin
 * Must be used after authenticate middleware
 */
exports.authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin authorization required'
    });
  }
};
