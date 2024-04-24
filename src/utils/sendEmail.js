import { transporter } from "../config/nodemailerConfig.js";

/**
 * Sends an email with the specified subject and message.
 *
 * @param {string} subject - The subject of the email.
 * @param {string} message - The message content of the email.
 * @return {Promise} A Promise that resolves when the email is sent.
 */
async function sendEmail(subject, message) {
  const infoEmail = await transporter.sendMail({
    from: `"Backup Service" <${process.env.EMAIL_FROM}>`, // sender address
    to: process.env.EMAIL_TO, // list of receivers
    subject: subject,
    text: message, // plain text body
  });

  console.log("Message sent: %s", infoEmail.messageId);
}

export { sendEmail };
