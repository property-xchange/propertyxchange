// api/controllers/auth.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../email/email.js";
import { generateTokenCookie } from "../utils/generateTokenCookie.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if all fields are provided
    if (!email || !username || !password) {
      throw new Error("All fields are required");
    }

    console.log("Checking if user already exists...");
    const userAlreadyExist = await prisma.user.findFirst({
      where: { email },
    });

    // If user exists and is not verified, allow resending verification email
    if (userAlreadyExist && !userAlreadyExist.emailVerified) {
      console.log(
        "User exists but email is not verified. Resending verification email...",
      );

      const verificationToken = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const verificationTokenExpiredAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      try {
        // Send the verification email again
        await sendVerificationEmail(email, verificationToken);

        // Update the verification token and expiration time
        await prisma.user.update({
          where: { email },
          data: {
            verificationToken,
            verificationTokenExpiredAt,
          },
        });

        return res.status(200).json({
          success: true,
          message: "Verification email resent. Please check your inbox.",
        });
      } catch (error) {
        console.error("Error resending verification email:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again later.",
        });
      }
    }

    // If the user is already verified, throw an error
    if (userAlreadyExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists and email is verified.",
      });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const verificationTokenExpiredAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    try {
      // Try sending the verification email before creating the user
      await sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error("Error sending verification email:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }

    // Create the new user only after the verification email is successfully sent
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiredAt,
      },
    });

    console.log("User created:", user);

    // Generate and send a JWT cookie
    generateTokenCookie(res, user.id);

    res.status(201).json({
      success: true,
      message: "User created successfully. Please verify your email.",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (err) {
    console.error("Error in register function:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpiredAt: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiredAt: null,
      },
    });

    //await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifying email", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { email, emailVerified: false },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or email already verified.",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const verificationTokenExpiredAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Update the verification token
    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
        verificationTokenExpiredAt,
      },
    });

    res.status(200).json({
      success: true,
      message: "Verification email resent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Error resending verification email:", err);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email. Please try again later.",
    });
  }
};

// Complete fixed login function:
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔐 Login attempt for email:", email);

    // CHECK IF THE USER EXISTS
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // CHECK IF THE USER IS VERIFIED
    if (!user.emailVerified) {
      console.log("❌ User email not verified:", email);
      return res.status(400).json({
        success: false,
        message:
          "Email not verified. Please check your inbox and verify your email.",
      });
    }

    // CHECK IF THE PASSWORD IS CORRECT
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Password mismatch for email:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }

    // GENERATE COOKIE TOKEN AND GET THE TOKEN - ADD req PARAMETER
    console.log("✅ Generating token for user ID:", user.id);
    const token = generateTokenCookie(res, user.id, req); // ← ADD req HERE

    // UPDATE LAST LOGIN DATE
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    console.log("✅ Last login updated for user ID:", user.id);

    // Remove password from response
    const { password: removedPassword, ...userWithoutPassword } = user;

    // RETURN TOKEN IN RESPONSE BODY FOR FRONTEND TO STORE IN LOCALSTORAGE
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: userWithoutPassword,
      token,
      debug: {
        tokenGenerated: !!token,
        tokenLength: token?.length,
        userId: user.id,
        cookieSet: true,
      },
    });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({
      success: false,
      message: "Failed to login!",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    // Get multiple domains from environment variable
    const cookieDomains = process.env.COOKIE_DOMAINS
      ? process.env.COOKIE_DOMAINS.split(",")
      : [process.env.COOKIE_DOMAIN];

    // Clear cookies for all domains
    cookieDomains.forEach((domain) => {
      if (domain) {
        res.clearCookie("token", {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          domain: domain.trim(),
          path: "/",
        });
        console.log("🍪 Cookie cleared for domain:", domain.trim());
      }
    });

    // Also clear without domain (for localhost)
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    console.log("🍪 All cookies cleared");

    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 30 mins

    // Update the user with reset token and expiry
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiredAt: resetTokenExpiresAt,
      },
    });

    // Send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL_HOST}/reset-password/${resetToken}`,
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiredAt: { gt: new Date() }, // Check if token has expired
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id }, // Update based on user's ID
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiredAt: null,
      },
    });

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("Error in resetPassword", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        verified: true,
        emailVerified: true,
        profilePhoto: true,
        companyName: true,
        accountType: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ Auth check successful for user:", user.id);

    res.status(200).json({
      success: true,
      user,
      authenticated: true,
    });
  } catch (error) {
    console.error("❌ Error in checkAuth:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        verified: true,
        emailVerified: true,
        profilePhoto: true,
        companyName: true,
        accountType: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const debugAuth = async (req, res) => {
  res.json({
    message: "Debug auth endpoint",
    headers: {
      authorization: req.headers.authorization,
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    },
    cookies: req.cookies,
    userId: req.userId || "Not authenticated",
    userRole: req.userRole || "No role",
  });
};
