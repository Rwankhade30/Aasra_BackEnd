// routes/rescues.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Rescue = require('../models/Rescue');
const { nanoid } = require('nanoid');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${nanoid(6)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Validation helper
function validatePayload(body) {
  const errors = {};
  if (!body.location || !body.location.toString().trim()) errors.location = 'Location required';
  if (!body.description || !body.description.toString().trim()) errors.description = 'Description required';
  if (!body.category) errors.category = 'Category required';
  if (!body.urgency) errors.urgency = 'Urgency required';
  return errors;
}

// POST /api/rescues
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { location = '', description = '', contact_name = '', contact_number = '', category = '', urgency = '' } = req.body || {};
    const errors = validatePayload({ location, description, category, urgency });
    if (Object.keys(errors).length) {
      if (req.file) await fs.unlink(path.join(UPLOADS_DIR, req.file.filename)).catch(()=>{});
      return res.status(400).json({ errors });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const doc = new Rescue({
      location: location.toString(),
      description: description.toString(),
      contact_name: contact_name.toString(),
      contact_number: contact_number.toString(),
      category: category.toString(),
      urgency: urgency.toString(),
      imageUrl
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rescues
router.get('/', async (req, res) => {
  try {
    const list = await Rescue.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rescues/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Rescue.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/rescues/:id  (multipart/form-data optional image)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updates = {};
    const allowed = ['location','description','contact_name','contact_number','category','urgency','status'];
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const doc = await Rescue.findById(req.params.id);
    if (!doc) {
      if (req.file) await fs.unlink(path.join(UPLOADS_DIR, req.file.filename)).catch(()=>{});
      return res.status(404).json({ error: 'Not found' });
    }

    // if new image uploaded, delete old
    if (req.file && doc.imageUrl) {
      const oldPath = path.join(__dirname, '..', doc.imageUrl.replace(/^\//,''));
      fs.unlink(oldPath).catch(()=>{});
    }

    Object.assign(doc, updates);
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/rescues/:id
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Rescue.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.imageUrl) {
      const filePath = path.join(__dirname, '..', doc.imageUrl.replace(/^\//,''));
      fs.unlink(filePath).catch(()=>{});
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
