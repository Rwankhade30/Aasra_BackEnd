// models/Rescue.js
const mongoose = require('mongoose');

const RescueSchema = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  contact_name: { type: String, default: '' },
  contact_number: { type: String, default: '' },
  category: { type: String, required: true, trim: true },
  urgency: { type: String, enum: ['severe', 'moderate'], required: true },
  status: { type: String, default: 'Requested' },
  imageUrl: { type: String, default: null }, // stored as /uploads/filename
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
}, { collection: 'rescues' });

RescueSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Rescue', RescueSchema);
1