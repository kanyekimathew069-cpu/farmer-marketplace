const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Every route below requires an authenticated admin.
router.use(protect, authorize("admin"));

// GET /api/admin/stats - dashboard summary
router.get("/stats", async (req, res, next) => {
  try {
    const [totalFarmers, totalBuyers, pendingListings, approvedListings, totalOrders, revenueAgg] =
      await Promise.all([
        User.countDocuments({ role: "farmer" }),
        User.countDocuments({ role: "buyer" }),
        Product.countDocuments({ status: "pending" }),
        Product.countDocuments({ status: "approved" }),
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      ]);

    res.json({
      totalFarmers,
      totalBuyers,
      pendingListings,
      approvedListings,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
});

// ---- User management ----

// GET /api/admin/users
router.get("/users", async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/status - activate/deactivate a user
router.patch("/users/:id/status", async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/role - change a user's role
router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["farmer", "buyer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ---- Listing moderation ----

// GET /api/admin/products?status=pending
router.get("/products", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("farmer", "name email location")
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

// PATCH /api/admin/products/:id/approve
router.patch("/products/:id/approve", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "approved", rejectionReason: undefined },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Listing not found." });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/products/:id/reject
router.patch("/products/:id/reject", async (req, res, next) => {
  try {
    const { reason } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: reason || "Did not meet listing guidelines." },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Listing not found." });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Listing not found." });
    res.json({ message: "Listing removed." });
  } catch (err) {
    next(err);
  }
});

// ---- Order oversight ----

// GET /api/admin/orders
router.get("/orders", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate("buyer", "name email")
        .populate("farmer", "name email")
        .populate("product", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
