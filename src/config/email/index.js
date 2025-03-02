require("dotenv").config();
const host = process.env.HOST;
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
exports.sendMail = async (to, resetToken, isRegister) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: to,
      subject: `${
        isRegister ? `Verify your account` : `Reset your account password`
      }`,
      text: `Thanks for using our service. Please click the link below.`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h1 style="color: #ff4b5c;">Warning: Do not share this link!</h1>
          <p style="font-size: 16px; color: #555;">
            Thanks for using our service. Please click the button below to 
            ${isRegister ? "verify your account" : "reset your password"}.
          </p>
          <a href="${host}/${
        isRegister ? `verify` : `new-password`
      }/${resetToken}" 
            style="display: inline-block; padding: 12px 20px; margin: 20px 0; font-size: 18px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            ${isRegister ? `Verify Account` : `Reset Password`}
          </a>
          <p style="font-size: 14px; color: #777;">If you didn’t request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error(`Error when sending mail to ${to}:`, err.message);
  }
};
