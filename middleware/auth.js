// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    // 1) Try cookie first
    let token = req.cookies?.token;

    // 2) Fallback to Authorization header
    if (!token) {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
        token = auth.slice(7);
      }
    }

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (typeof user.changedPasswordAfter === 'function' && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: 'Password recently changed. Please login again.' });
    }

    user.password = undefined;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { authenticateToken, authorize };
