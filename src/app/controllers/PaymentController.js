const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");

const VNPayConfig = {
  tmnCode: process.env.VNP_TMNCODE,
  hashSecret: process.env.VNP_HASHSECRET,
  vnpUrl: process.env.VNP_URL,
  returnUrl: process.env.VNP_RETURNURL,
  apiUrl: process.env.VNP_API,
};

const sortObject = (obj) =>
  Object.keys(obj)
    .sort()
    .reduce(
      (sorted, key) => ({
        ...sorted,
        [key]: encodeURIComponent(obj[key]).replace(/%20/g, "+"),
      }),
      {}
    );

const generateSignature = (params) =>
  crypto
    .createHmac("sha512", VNPayConfig.hashSecret)
    .update(querystring.stringify(params, { encode: false }))
    .digest("hex");

exports.orderList = (req, res) =>
  res.render("payments/orderlist", { title: "Danh sách đơn hàng" });
exports.createPaymentPage = (req, res) =>
  res.render("payments/order", { title: "Tạo mới đơn hàng", amount: 10000 });
exports.queryTransactionPage = (req, res) =>
  res.render("payments/querydr", { title: "Truy vấn kết quả thanh toán" });
exports.refundPage = (req, res) =>
  res.render("payments/refund", { title: "Hoàn tiền giao dịch thanh toán" });

exports.createPayment = (req, res) => {
  const date = moment();
  let vnp_Params = sortObject({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPayConfig.tmnCode,
    vnp_Locale: req.body.language || "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: date.format("DDHHmmss"),
    vnp_OrderInfo: `Thanh toán cho mã GD: ${date.format("DDHHmmss")}`,
    vnp_OrderType: "other",
    vnp_Amount: req.body.amount * 100,
    vnp_ReturnUrl: VNPayConfig.returnUrl,
    vnp_IpAddr: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    vnp_CreateDate: date.format("YYYYMMDDHHmmss"),
    vnp_BankCode: req.body.bankCode || "VNPAY",
  });

  vnp_Params.vnp_SecureHash = generateSignature(vnp_Params);
  res.redirect(
    `${VNPayConfig.vnpUrl}?${querystring.stringify(vnp_Params, {
      encode: false,
    })}`
  );
};

const verifyResponse = (params) => {
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const isValidChecksum = secureHash === generateSignature(sortObject(params));

  return {
    success: isValidChecksum && params.vnp_ResponseCode === "00",
    responseCode: params.vnp_ResponseCode || "97",
    message: isValidChecksum
      ? params.vnp_ResponseCode === "00"
        ? "Giao dịch thành công"
        : "Giao dịch thất bại"
      : "Lỗi xác thực checksum",
    transactionId: params.vnp_TxnRef || null,
    amount: params.vnp_Amount ? params.vnp_Amount / 100 : null,
    bankCode: params.vnp_BankCode || null,
    paymentTime: params.vnp_PayDate || null,
  };
};

exports.vnpayReturn = (req, res) => {
  const result = verifyResponse(req.query);
  res.render("payments/success", {
    code: result.responseCode,
    message: result.message,
    transactionId: result.transactionId,
    amount: result.amount,
    bankCode: result.bankCode,
    paymentTime: result.paymentTime,
  });
};

exports.vnpayIPN = (req, res) => {
  const result = verifyResponse(req.query);
  res.json({
    RspCode: result.success ? "00" : "97",
    Message: result.message,
    Transaction: {
      id: result.transactionId,
      amount: result.amount,
      bankCode: result.bankCode,
      paymentTime: result.paymentTime,
    },
  });
};
