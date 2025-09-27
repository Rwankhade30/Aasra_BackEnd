// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// near top, after express.json()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Allowed origins (adjust to your frontend origins)
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

// Dynamic CORS options to support credentials and only allow whitelisted origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests like curl/postman (origin === undefined)
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from ' + origin), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // <-- allows cookies/Authorization header with fetch credentials: 'include'
  optionsSuccessStatus: 204
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// public auth routes (register + login)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rescues', require('./routes/rescues'));
// public health check
app.get('/', (req, res) => res.send('Server up'));

// import auth middleware AFTER public routes
const { authenticateToken } = require('./middleware/auth');

// protect everything below this line
app.use(authenticateToken);

// protected routes
app.use('/api/users', require('./routes/users'));

// generic 404
app.use((req, res) => res.status(404).json({ error: 'Resource/API/Route Not found' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Mongo connect then start ---
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI / MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // increase if needed
})
  .then(() => {
    console.log('Mongo connected');
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      console.log('Tip: set JWT_SECRET env variable in production.');
    });
  })
  .catch(err => {
    console.error('Mongo connection error:', err.message || err);
    process.exit(1);
  });
