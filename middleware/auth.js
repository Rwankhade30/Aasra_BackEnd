// middlesware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    // If model has changedPasswordAfter, reject tokens issued before password change
    if (typeof user.changedPasswordAfter === 'function' && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: 'Password recently changed. Please login again.' });
    }

    // hide password and attach user
    user.password = undefined;
    req.user = user;
    next();
  } catch (err) {
    // jwt.verify throws on invalid/expired token
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// usage: authorize('admin') or authorize('user', 'admin')
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { authenticateToken, authorize };
