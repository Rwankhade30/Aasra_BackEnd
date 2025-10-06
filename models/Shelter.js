// models/Shelter.js
const mongoose = require('mongoose');

const ShelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },          // e.g., "Andheri West, Mumbai, MH"
    pincode: { type: String, trim: true },                        // e.g., "400053"
    phone: { type: String, trim: true },
    logo: { type: String, trim: true },
    description: { type: String, trim: true },
    viewLink: { type: String, trim: true },                       // internal route or external link
  },
  { timestamps: true }
);

// Helpful indexes for your filters
ShelterSchema.index({ name: 1 });
ShelterSchema.index({ city: 1, pincode: 1, createdAt: -1 });

module.exports = mongoose.model('Shelter', ShelterSchema);
