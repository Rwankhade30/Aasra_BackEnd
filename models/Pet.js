// models/Pet.js
const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: String, trim: true },          // e.g., "2 years"
    breed: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
    size: { type: String, enum: ["Small", "Medium", "Large"], default: "Medium" },
    city: { type: String, trim: true },

    photo: { type: String, trim: true },        // image URL
    description: { type: String, trim: true },

    shelter: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Shelter" },
      name: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

PetSchema.index({ name: 1 });
PetSchema.index({ breed: 1 });
PetSchema.index({ "shelter.id": 1 });

module.exports = mongoose.model("Pet", PetSchema);
