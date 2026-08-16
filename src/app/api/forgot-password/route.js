import crypto from "crypto";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { User } from "@/models/User";

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}

/*
 * Gmail SMTP transporter
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req) {
  try {
    console.log("FORGOT PASSWORD: API CALLED");

    await connectDB();

    const { email } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();

    console.log(
      "FORGOT PASSWORD: EMAIL:",
      cleanEmail
    );

    if (!cleanEmail) {
      return Response.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Find user
     */
    const user = await User.findOne({
      email: cleanEmail,
    });

    console.log(
      "FORGOT PASSWORD: USER FOUND:",
      !!user
    );

    /*
     * Don't reveal whether an account exists.
     */
    if (!user) {
      return Response.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    /*
     * Google-only accounts don't have a password.
     */
    if (!user.password) {
      return Response.json({
        success: true,
        message:
          "This account uses Google login. Please continue with Google.",
      });
    }

    /*
     * Generate secure random token
     */
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    /*
     * Hash token before storing it in MongoDB
     */
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    /*
     * Token expires after 30 minutes
     */
    const expiry = new Date(
      Date.now() + 30 * 60 * 1000
    );

    user.resetToken = hashedToken;
    user.resetTokenExpiry = expiry;

    await user.save();

    console.log(
      "FORGOT PASSWORD: RESET TOKEN SAVED"
    );

    /*
     * Create password reset URL
     */
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(
      "FORGOT PASSWORD: RESET URL CREATED"
    );

    /*
     * Send email using Gmail SMTP
     */
    const mailOptions = {
      from: `"Food Ordering App" <${process.env.EMAIL_USER}>`,

      to: cleanEmail,

      subject: "Reset your password",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
          "
        >

          <h2 style="color: #e11d48;">
            Reset your password
          </h2>

          <p>
            We received a request to reset the password
            for your Food Ordering account.
          </p>

          <p>
            Click the button below to choose a new password.
          </p>

          <div style="margin: 30px 0;">

            <a
              href="${resetUrl}"
              style="
                background: #e11d48;
                color: white;
                padding: 12px 22px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
              "
            >
              Reset Password
            </a>

          </div>

          <p>
            This password reset link will expire in
            <strong>30 minutes</strong>.
          </p>

          <p>
            If you didn't request a password reset,
            you can safely ignore this email.
          </p>

          <hr style="margin: 30px 0;" />

          <p
            style="
              font-size: 12px;
              color: #6b7280;
            "
          >
            If the button doesn't work, copy and paste
            this link into your browser:
          </p>

          <p
            style="
              font-size: 12px;
              word-break: break-all;
              color: #6b7280;
            "
          >
            ${resetUrl}
          </p>

        </div>
      `,
    };

    console.log(
      "FORGOT PASSWORD: SENDING EMAIL..."
    );

    await transporter.sendMail(mailOptions);

    console.log(
      "FORGOT PASSWORD: EMAIL SENT SUCCESSFULLY"
    );

    return Response.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });

  } catch (error) {

    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to send password reset email. Please try again later.",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}