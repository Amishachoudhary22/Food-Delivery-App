import { User } from "@/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const body = await req.json();

    const email = body?.email?.toLowerCase().trim();
    const newPassword = body?.newPassword;

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 5) {
      return Response.json(
        { error: "Password must be at least 5 characters long" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URL);
    }

    // Find the existing account
    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // IMPORTANT:
    // Only allow resetting an account that is already an admin.
    if (user.admin !== true) {
      console.log("Admin check failed:", {
        email: user.email,
        admin: user.admin,
      });

      return Response.json(
        {
          error: "This account is not marked as admin",
          adminValue: user.admin,
        },
        { status: 403 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the existing account
    user.password = hashedPassword;

    await user.save();

    return Response.json(
      {
        success: true,
        message: "Admin password reset successfully",
        email: user.email,
        admin: user.admin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN PASSWORD RESET ERROR:", error);

    return Response.json(
      {
        error: "Password reset failed",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}