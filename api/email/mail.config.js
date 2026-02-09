// api/email/mail.config.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your regular password)
  },
});

export const sender = {
  name: process.env.SENDER_NAME || "PropertyXchange Team",
  address: process.env.GMAIL_USER,
};

// import nodemailer from "nodemailer";
// // import { MailtrapTransport } from 'mailtrap';
// import dotenv from "dotenv";

// dotenv.config();

// // console.log(process.env.BREVO_SMTP_HOST);
// // console.log(process.env.BREVO_SMTP_PORT);
// // console.log(process.env.BREVO_SMTP_SECURE);
// // console.log(process.env.BREVO_SMTP_USER);
// // console.log(process.env.BREVO_SMTP_PASS);

// export const transporter = nodemailer.createTransport({
//   host: process.env.BREVO_SMTP_HOST,
//   port: process.env.BREVO_SMTP_PORT,
//   secure: process.env.BREVO_SMTP_SECURE,
//   auth: {
//     user: process.env.BREVO_SMTP_USER,
//     pass: process.env.BREVO_SMTP_PASS,
//   },
// });

// // export const transporter = nodemailer.createTransport(
// //   MailtrapTransport({
// //     token: process.env.MAILTRAP_API_TOKEN,
// //   })
// // );

// export const sender = {
//   name: process.env.MAILTRAP_SENDER_NAME,
//   address: process.env.MAILTRAP_SENDER_EMAIL,
// };

// // const testEmail = async () => {
// //   try {
// //     const result = await transporter.sendMail({
// //       from: {
// //         name: 'PropertyXchange Team',
// //         address: 'mailtrap@demomailtrap.com',
// //       },
// //       to: 'opulecalebtins@gmail.com',
// //       subject: 'Test Email',
// //       html: '<p>This is a test email sent via Mailtrap Send API.</p>',
// //     });
// //     console.log('Email result:', result);
// //   } catch (error) {
// //     console.error('Test email error:', error);
// //   }
// // };

// // testEmail();
