const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// GET /api/products - public browse, only approved + in-stock listings, with filters
router.get("/", async (req, res, next) => {
  try {
    const { category, search, location, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const filter = { status: "approved", quantityAvailable: { $gt: 0 } };
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, "i");
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("farmer", "name location phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/mine - farmer's own listings, any status
router.get("/mine", protect, authorize("farmer"), async (req, res, next) => {
  try {
    const items = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("farmer", "name location phone");
    if (!product) return res.status(404).json({ message: "Listing not found." });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products - farmer creates a listing (goes to "pending" for admin review)
router.post(
  "/",
  protect,
  authorize("farmer"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("pricePerUnit").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("quantityAvailable").isFloat({ min: 0 }).withMessage("Quantity must be a positive number"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const product = await Product.create({
        ...req.body,
        farmer: req.user._id,
        status: "pending",
      });
      res.status(201).json({ product });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/products/:id - farmer edits own listing (resets to pending review)
router.put("/:id", protect, authorize("farmer"), async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: "Listing not found." });

    const editable = ["title", "description", "category", "unit", "pricePerUnit", "quantityAvailable", "location", "images"];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    product.status = "pending"; // re-review after edits
    await product.save();

    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - farmer removes own listing
router.delete("/:id", protect, authorize("farmer"), async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: "Listing not found." });
    res.json({ message: "Listing deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
