const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders - buyer places an order
router.post(
  "/",
  protect,
  authorize("buyer"),
  [
    body("productId").notEmpty().withMessage("productId is required"),
    body("quantity").isFloat({ gt: 0 }).withMessage("Quantity must be greater than 0"),
  ],
  async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      const { productId, quantity, deliveryLocation, notes } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      let createdOrder;
      await session.withTransaction(async () => {
        const product = await Product.findById(productId).session(session);
        if (!product || product.status !== "approved") {
          throw { status: 404, message: "Listing not available." };
        }
        if (product.quantityAvailable < quantity) {
          throw { status: 400, message: "Not enough quantity available." };
        }

        product.quantityAvailable -= quantity;
        if (product.quantityAvailable === 0) product.status = "sold_out";
        await product.save({ session });

        createdOrder = await Order.create(
          [
            {
              buyer: req.user._id,
              farmer: product.farmer,
              product: product._id,
              quantity,
              unitPriceAtOrder: product.pricePerUnit,
              totalPrice: product.pricePerUnit * quantity,
              deliveryLocation,
              notes,
            },
          ],
          { session }
        );
      });

      res.status(201).json({ order: createdOrder[0] });
    } catch (err) {
      next(err.status ? err : err);
    } finally {
      session.endSession();
    }
  }
);

// GET /api/orders/mine - buyer's own orders
router.get("/mine", protect, authorize("buyer"), async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title unit")
      .populate("farmer", "name phone location")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/incoming - farmer's incoming orders for their products
router.get("/incoming", protect, authorize("farmer"), async (req, res, next) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate("product", "title unit")
      .populate("buyer", "name phone location")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status - farmer updates order status
router.patch(
  "/:id/status",
  protect,
  authorize("farmer"),
  [body("status").isIn(["confirmed", "shipped", "delivered", "cancelled"])],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id });
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = req.body.status;
      await order.save();
      res.json({ order });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
