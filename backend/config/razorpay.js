const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkartSecretKey456"
});

module.exports = razorpay;
