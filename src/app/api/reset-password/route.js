import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "@/models/User";

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const {
      email,
      token,
      password,
    } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !token || !password) {
      return Response.json(
        {
          error:
            "Email, token and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          error:
            "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: cleanEmail,
      resetToken: hashedToken,
      resetTokenExpiry: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return Response.json(
        {
          error:
            "This reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;

    // Make the reset token single-use.
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return Response.json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return Response.json(
      {
        error:
          "Unable to reset password. Please try again.",
      },
      { status: 500 }
    );
  }
}