// routes/shelters.js
const express = require('express');
const router = express.Router();
const Shelter = require('../models/Shelter');

/**
 * GET /api/shelters
 * Query params:
 *  - location: matches city OR pincode (case-insensitive substring)
 *  - name: matches shelter name (case-insensitive substring)
 *  - page: number (default 1) -- only used for non-random results
 *  - limit: number (default 10, max 100)
 *  - sort: comma separated fields e.g. "-createdAt,name" (default "-createdAt")
 *
 * Behavior:
 *  - If neither `location` nor `name` provided: return a random sample of size `limit`.
 *  - If `location` or `name` provided: perform case-insensitive substring search (OR logic),
 *    support pagination and return total count in meta.
 */
router.get('/', async (req, res) => {
  try {
    const {
      location = '',
      name = '',
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const hasSearch = (location && String(location).trim()) || (name && String(name).trim());

    if (!hasSearch) {
      // RANDOM SAMPLE when user first visits (or when no search criteria)
      const sampleSize = limitNum;
      // Use aggregation with $sample for performance / randomness
      const pipeline = [{ $sample: { size: sampleSize } }];

      // Optionally project only necessary fields (you can adjust)
      // pipeline.push({ $project: { name:1, city:1, pincode:1, phone:1, logo:1, description:1, viewLink:1, createdAt:1 }});

      const data = await Shelter.aggregate(pipeline);
      // no total pagination for sample; return meta with sample size
      return res.json({
        data,
        meta: {
          total: data.length,
          page: 1,
          limit: sampleSize,
          random: true,
        },
      });
    }

    // Build search query (OR logic across location and name)
    const orClauses = [];
    if (location && String(location).trim()) {
      const loc = String(location).trim();
      const locRegex = new RegExp(loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // escape regex
      orClauses.push({ city: locRegex }, { pincode: locRegex });
    }
    if (name && String(name).trim()) {
      const nm = String(name).trim();
      const nameRegex = new RegExp(nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      orClauses.push({ name: nameRegex });
    }

    const query = orClauses.length ? { $or: orClauses } : {};

    // parse sort string into object
    const sortObj = {};
    String(sort)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((field) => {
        if (field.startsWith('-')) sortObj[field.slice(1)] = -1;
        else sortObj[field] = 1;
      });
    // default fallback
    if (!Object.keys(sortObj).length) sortObj.createdAt = -1;

    const [data, total] = await Promise.all([
      Shelter.find(query)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Shelter.countDocuments(query),
    ]);

    res.json({
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
        random: false,
      },
    });
  } catch (err) {
    console.error('Shelters list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/shelters/:id
 * (unchanged): returns single shelter by id
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Shelter.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Shelter detail error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
