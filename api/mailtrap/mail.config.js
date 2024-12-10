import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TOKEN_KEY;

export const transporter = nodemailer.createTransport({
  host: 'live.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'api',
    pass: TOKEN,
  },
  connectionTimeout: 60000,
});

export const welcomeTransporter = nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

export const sender = {
  address: 'no-reply@propertyxchange.com.ng',
  name: 'PropertyXchange Team',
};
