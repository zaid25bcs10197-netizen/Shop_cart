const express = require("express");
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// POST /cart/:productId - Add product to cart
router.post("/:productId", addToCart);

// GET /cart - Get current user's cart
router.get("/", getCart);

// PATCH /cart/:productId - Update quantity
router.patch("/:productId", updateCartQuantity);

// DELETE /cart/:productId - Remove product from cart
router.delete("/:productId", removeFromCart);

module.exports = router;
