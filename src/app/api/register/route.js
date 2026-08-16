import { User } from "@/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    // -----------------------------
    // READ REQUEST BODY
    // -----------------------------
    const body = await req.json();

    const name = body?.name?.trim();
    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    // -----------------------------
    // VALIDATE NAME
    // -----------------------------
    if (!name) {
      return Response.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // VALIDATE EMAIL
    // -----------------------------
    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // VALIDATE PASSWORD
    // -----------------------------
    if (!password || password.length < 5) {
      return Response.json(
        { error: "Password must be at least 5 characters long" },
        { status: 400 }
      );
    }

    // -----------------------------
    // CONNECT TO MONGODB
    // -----------------------------
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URL);
    }

    // -----------------------------
    // CHECK IF USER ALREADY EXISTS
    // -----------------------------
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        {
          error:
            "An account with this email already exists. Please login instead.",
        },
        { status: 409 }
      );
    }

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    // CREATE USER
    // -----------------------------
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      admin: false,
    });

    // Don't send password hash back to browser
    const safeUser = {
      id: createdUser._id.toString(),
      email: createdUser.email,
      name: createdUser.name || "",
    };

    return Response.json(safeUser, { status: 201 });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    return Response.json(
      {
        error: "Registration failed",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}