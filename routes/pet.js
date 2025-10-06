// routes/pets.js
const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");

/**
 * GET /api/pets
 * Query params:
 *  - shelterId: filter pets belonging to a shelter
 *  - breed, gender, size, city (optional filters)
 */
router.get("/", async (req, res) => {
  try {
    const { shelterId, breed, gender, size, city } = req.query;

    const query = {};
    if (shelterId) query["shelter.id"] = shelterId;
    if (breed) query.breed = new RegExp(breed, "i");
    if (gender) query.gender = gender;
    if (size) query.size = size;
    if (city) query.city = new RegExp(city, "i");

    const data = await Pet.find(query).sort({ createdAt: -1 }).lean();
    res.json({ data, total: data.length });
  } catch (err) {
    console.error("Pets list error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/pets/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const item = await Pet.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    console.error("Pet detail error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
