// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path if needed

const router = express.Router();

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

function setTokenCookie(res, token) {
  // For localhost dev:

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',      // keep 'lax' on http://localhost
    secure: true,       // enable + sameSite:'none' only on HTTPS prod
    path: '/',
  });
}

function clearTokenCookie(res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

function getTokenFromReq(req) {
  // 1) Authorization: Bearer <token>
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  // 2) Cookie: token=<jwt>
  const raw = req.headers.cookie;
  if (raw) {
    const parts = raw.split(';').map(s => s.trim());
    for (const p of parts) {
      if (p.startsWith('token=')) return decodeURIComponent(p.slice(6));
    }
  }
  return null;
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    setTokenCookie(res, token);

    const safeUser = user.toObject();
    delete safeUser.password;

    // Keep token in response for flexibility; frontend can ignore if using cookies.
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    setTokenCookie(res, token);

    const safeUser = user.toObject();
    delete safeUser.password;

    // Include both token and user; your AuthContext will call /me anyway.
    res.json({ token, user: safeUser, login: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /auth/me  (auth required via cookie or Authorization header)
router.get('/me', async (req, res) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    res.json({ user });
  } catch (err) {
    // Token invalid/expired → 401
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ logout: true });
});

module.exports = router;
