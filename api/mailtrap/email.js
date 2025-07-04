import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from './emailTemplates.js';
import { sender, transporter } from './mail.config.js';

export const sendVerificationEmail = async (email, verificationToken) => {
  //const recipient = [{ email }];
  console.log('Sending email to:', email);

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      ),
    });
    console.log('Email sent successfully', response);
  } catch (error) {
    console.error(`Failed to send email to: ${email}. Error:`, error);
    console.error(`Error sending verification`, error);
    console.error(`Full error details:`, error.stack);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  //const recipient = [{ email }];

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Welcome to PropertyXchange',
      html: WELCOME_EMAIL_TEMPLATE.replace('{name}', name),
    });

    console.log('Welcome email sent successfully', response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  //const recipient = [{ email }];

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
      category: 'Password Reset',
    });
  } catch (error) {
    console.error(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  //const recipient = [{ email }];

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: 'Password Reset Successful',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: 'Password Reset',
    });

    console.log('Password reset email sent successfully', response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
