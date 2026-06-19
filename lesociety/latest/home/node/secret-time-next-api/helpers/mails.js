const nodemailer = require('nodemailer');
const axios = require('axios');

require('../lib/env');
/**
 * mail helper to send mail
 */
exports.sendMail = (mailOptions, callBack) => {
  try {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.SENDGRID_KEY;
    if (!apiKey) {
      throw new Error("Missing SendGrid API key (set SENDGRID_API_KEY).");
    }

    const useApi = String(process.env.SENDGRID_USE_API || "true").toLowerCase() !== "false";

    const result = useApi
      ? axios.post(
          "https://api.sendgrid.com/v3/mail/send",
          {
            personalizations: [
              {
                to: Array.isArray(mailOptions.to)
                  ? mailOptions.to.map((email) => ({ email }))
                  : [{ email: mailOptions.to }],
                subject: mailOptions.subject,
              },
            ],
            from: { email: mailOptions.from },
            content: [
              {
                type: "text/html",
                value: mailOptions.html || "",
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        )
      : nodemailer
          .createTransport({
            host: process.env.SENDGRID_SMTP_HOST || "smtp.sendgrid.net",
            port: Number(process.env.SENDGRID_SMTP_PORT || 587),
            secure: false,
            auth: {
              user: 'apikey',
              pass: apiKey,
            },
          })
          .sendMail(mailOptions);

    if (typeof callBack === "function") {
      result.then((info) => callBack(null, info)).catch((err) => callBack(err));
    }
    return result;
  } catch (error) {
    if (typeof callBack === "function") {
      callBack(error);
    }
    return Promise.reject(error);
  }
};
