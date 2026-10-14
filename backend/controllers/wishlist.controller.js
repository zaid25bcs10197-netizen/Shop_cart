const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Task 2: Add Product to Wishlist
 * POST /wishlist/:productId
 */
async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Identify user from authentication middleware
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Prevent duplicates
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist"
      });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist"
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Task 3: Get Current User's Wishlist
 * GET /wishlist
 */
async function getWishlist(req, res) {
  try {
    // Current user identified from auth middleware
    const user = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description createdAt"
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Filter out any dangling references if a product was deleted
    const validWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Task 4: Remove Product from Wishlist
 * DELETE /wishlist/:productId
 */
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist"
      });
    }

    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist"
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Bonus Task 23: Wishlist Toggle
 * PATCH /wishlist/:productId/toggle
 */
async function toggleWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId.toString()
    );

    if (itemIndex !== -1) {
      // Remove
      user.wishlist.splice(itemIndex, 1);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        isWishlisted: false
      });
    } else {
      // Verify product exists before adding
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      user.wishlist.push(productId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        isWishlisted: true
      });
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
};
