import nodemailer from "nodemailer";
import config from "../config/config.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  auth: {
    user: config.smtpEmail,
    pass: config.smtpPassword,
  },
});

function otpMailOptions(to, otp) {
  return {
    from: `"${config.smtpFromName}" <${config.smtpEmail}>`, // sender address
    to: to, // receiver address
    subject: "Stickies - One Time Password", // Subject line
    text: `To authenticate, please use the following One Time Password (OTP):
          ${otp}
      Don't share this OTP with anyone.`, // plain text body
    html: `<html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
          <style type="text/css">
          h2 {
            font-size: 18px;
          }  
          .otp{
                font-size:22px !important;
                font-weight:bold;
            }
          </style>
      </head>
      <body>
        <h2>Stickies - One Time Password</h2>
        <div>
            <p>To authenticate, please use the following One Time Password (OTP):</p>
            <p class="otp">${otp}</p>
            <p>Don't share this OTP with anyone.</p>
        </div>
      </body>
    </html>`, // HTML body
  };
}

async function sendOTPEmail(to, otp) {
  const mailOptions = otpMailOptions(to, otp);
  try {
    await transporter.sendMail(mailOptions);
    logger.info("OTP email sent to: " + to);
  } catch (error) {
    logger.error("Error sending OTP email: ", error);
  }
}

export { sendOTPEmail };
