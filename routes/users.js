// routes/users.js
const express = require('express');
const { authorize } = require('../middleware/auth');
const User = require('../models/User'); // adjust path if needed
const router = express.Router();


// GET /users -> admin only
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'name email -_id').lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
