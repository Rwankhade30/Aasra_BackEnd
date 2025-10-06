// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// static + health (public)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.send('Server up'));

// --- CORS (unchanged) ---
const allowedOrigins = new Set(['http://localhost:3000','http://127.0.0.1:3000']);
const corsOptions = {
  origin: (origin, cb) => { if (!origin || allowedOrigins.has(origin)) return cb(null, true); cb(new Error('CORS not allowed from ' + origin), false); },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// --- Public auth routes only ---
app.use('/api/auth', require('./routes/auth')); // register/login(/me, /logout if you have them)

// ---- Auth gate for everything else ----
const { authenticateToken } = require('./middleware/auth');

/**
 * Whitelist only these paths as public; everything else needs a valid JWT.
 * Keep OPTIONS public so CORS preflight succeeds.
 */
app.use('/api/rescues', require('./routes/rescues'));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const publicMatchers = [
    /^\/$/,                      // health
    /^\/uploads(\/|$)/,          // static files
    /^\/api\/auth(\/|$)/         // login/register/(me|logout)
  ];

  if (publicMatchers.some(rx => rx.test(req.path))) return next();

  // everything else must be authenticated
    return authenticateToken(req, res, next);
});

// ---- Protected routes (all of these now require JWT) ----
app.use('/api/users', require('./routes/users'));
app.use('/api/shelters', require('./routes/shelters'));

// 404 + error handler
app.use((req, res) => res.status(404).json({ error: 'Resource/API/Route Not found' }));
app.use((err, req, res, next) => {
  // If your auth middleware sets 401/403, respect it:
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Mongo connect then start (unchanged) ---
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('MONGO_URI / MONGODB_URI not set in .env'); process.exit(1); }

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('Mongo connected');
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      console.log('Tip: set JWT_SECRET env variable in production.');
    });
  })
  .catch(err => { console.error('Mongo connection error:', err.message || err); process.exit(1); });
