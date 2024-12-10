import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

let config = {
  host: process.env.HOST,
  service: process.env.SERVICE,
  port: Number(process.env.EMAIL_PORT),
  secure: Boolean(process.env.SECURE),
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};

export const emailVerify = async (username, email, subject, text) => {
  let transporter = nodemailer.createTransport(config);

  let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Mailgen',
      link: 'https://mailgen.js/',
    },
  });

  var emailGen = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to propertyXchange! We're very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  var emailBody = MailGenerator.generate(emailGen);

  let message = {
    from: process.env.EMAIL,
    to: email,
    subject: subject || 'Signup Successful',
    html: emailBody,
  };
};
