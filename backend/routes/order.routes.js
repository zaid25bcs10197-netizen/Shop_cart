const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

// POST /orders and /orders/create-payment-order: Validate cart, stock, calculate server total and create Razorpay order
router.post("/create-payment-order", authMiddleware, orderController.createPaymentOrder);
router.post("/", authMiddleware, orderController.createPaymentOrder);

// POST /orders/verify-payment: Verify Razorpay signature, mark order PAID/PLACED, and clear cart
router.post("/verify-payment", authMiddleware, orderController.verifyPayment);

// Helper for test simulator: Generate test signature
router.post("/generate-test-signature", authMiddleware, orderController.generateTestSignature);

// GET /orders: Retrieve all orders for authenticated user
router.get("/", authMiddleware, orderController.getUserOrders);

// GET /orders/:id: Retrieve single order detail with user ownership check
router.get("/:id", authMiddleware, orderController.getOrderById);

// PATCH /orders/:id/status: Bonus challenge - progress order status
router.patch("/:id/status", authMiddleware, orderController.updateOrderStatus);

module.exports = router;
