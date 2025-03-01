const express = require("express");
const router = express.Router();
const VNPayController = require("../app/controllers/PaymentController");

router.get("/", VNPayController.orderList);

router.get("/create-payment", VNPayController.createPaymentPage);
router.post("/create-payment", VNPayController.createPayment);

router.get("/query-transaction", VNPayController.queryTransactionPage);

router.get("/refund", VNPayController.refundPage);

router.get("/vnpay-return", VNPayController.vnpayReturn);

router.post("/vnpay-ipn", VNPayController.vnpayIPN);

module.exports = router;
