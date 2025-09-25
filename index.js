// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// public auth routes (register + login)
app.use('/auth', require('./routes/auth'));

// public health check
app.get('/', (req, res) => res.send('Server up'));

// import auth middleware AFTER public routes
const { authenticateToken } = require('./middleware/auth');

// protect everything below this line
app.use(authenticateToken);

// protected routes
app.use('/users', require('./routes/users'));

// generic 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

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
