const express = require("express");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// POST /wishlist/:productId - Add product to wishlist
router.post("/:productId", addToWishlist);

// GET /wishlist - Get current user's wishlist
router.get("/", getWishlist);

// DELETE /wishlist/:productId - Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

// PATCH /wishlist/:productId/toggle - Bonus: Toggle product in wishlist
router.patch("/:productId/toggle", toggleWishlist);

module.exports = router;
