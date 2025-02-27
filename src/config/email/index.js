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
exports.sendMail = async (to, resetToken) => {
  try {
    await transporter.sendMail(
      {
        from: process.env.EMAIL,
        to: to,
        subject: "Restaurant Reset password",
        text: `Thanks for using our service. Please click the link below.`,
        html: `<div><h1>Please don't sharelink any one</h1><a href="${host}/new-password/${resetToken}">Click here to reset your password</a></div>`,
      },
      (err, info) => {
        if (err) {
          console.error("Error when send mail to ", to);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );
  } catch (err) {
    console.error("Error when send mail to ", to);
  }
};
