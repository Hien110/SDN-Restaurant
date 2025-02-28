// router.js
const express = require("express");
const router = express.Router();
const VNPayController = require("../app/controllers/PaymentController");

router.get("/", VNPayController.orderList);
router.get("/create_payment_url", VNPayController.createPaymentPage);
router.get("/querydr", VNPayController.queryTransactionPage);
router.get("/refund", VNPayController.refundPage);
router.post("/create_payment_url", VNPayController.createPayment);
router.get("/vnpay_return", VNPayController.vnpayReturn);
router.get("/vnpay_ipn", VNPayController.vnpayIPN);

module.exports = router;
