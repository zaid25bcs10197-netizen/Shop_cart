const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Safely extracts ObjectId string whether populated object or raw ObjectId
 */
function getProductId(productRef) {
  if (!productRef) return "";
  if (productRef._id) return productRef._id.toString();
  return productRef.toString();
}

/**
 * Task 2: Add Product to Cart API
 * POST /cart/:productId
 */
async function addToCart(req, res) {
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

    if (!user.cart) {
      user.cart = [];
    }

    const addQty =
      req.body && typeof req.body.quantity === "number" && req.body.quantity > 0
        ? Math.floor(req.body.quantity)
        : 1;

    // Check if product is already in the cart
    const itemIndex = user.cart.findIndex(
      (item) => getProductId(item.product) === productId.toString()
    );

    if (itemIndex > -1) {
      // Product is already present -> increase existing quantity
      const targetQuantity = user.cart[itemIndex].quantity + addQty;

      if (targetQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Quantity exceeds available stock. Only ${product.stock} units available.`
        });
      }

      user.cart[itemIndex].quantity = targetQuantity;
    } else {
      // Product is not in cart -> add product with quantity
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock"
        });
      }

      if (addQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Quantity exceeds available stock. Only ${product.stock} units available.`
        });
      }

      user.cart.push({
        product: productId,
        quantity: addQty
      });
    }

    await user.save();

    // Populate updated cart
    await user.populate({
      path: "cart.product",
      select: "name description price category image stock createdAt"
    });

    const validCart = user.cart.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Task 3: Get Current User Cart
 * GET /cart
 */
async function getCart(req, res) {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name description price category image stock createdAt"
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Filter out any dangling items if a product was deleted
    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: validCart
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Task 4: Update Product Quantity
 * PATCH /cart/:productId
 * Request body: { "quantity": 3 }
 */
async function updateCartQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // Validate quantity is a number
    if (quantity === undefined || quantity === null || typeof quantity !== "number" || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number"
      });
    }

    // Quantity must be at least 1
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Validate stock limit
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock. Only ${product.stock} units available.`
      });
    }

    // Load user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    // Check if product is in cart
    const itemIndex = user.cart.findIndex(
      (item) => getProductId(item.product) === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart"
      });
    }

    user.cart[itemIndex].quantity = Math.floor(quantity);
    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name description price category image stock createdAt"
    });

    const validCart = user.cart.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: validCart
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Task 5: Remove Product from Cart
 * DELETE /cart/:productId
 */
async function removeFromCart(req, res) {
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

    if (!user.cart) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => getProductId(item.product) === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart"
      });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name description price category image stock createdAt"
    });

    const validCart = user.cart.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
