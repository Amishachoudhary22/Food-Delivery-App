import mongoose from "mongoose";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}


// ==========================================
// GET USER CART
// ==========================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        {
          cart: [],
          authenticated: false,
        },
        { status: 200 }
      );
    }

    await connectDB();

    const email = session.user.email
      .toLowerCase()
      .trim();

    const user = await User.findOne({ email })
      .select("cart")
      .lean();

    if (!user) {
      return Response.json(
        {
          cart: [],
          authenticated: true,
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        cart: user.cart || [],
        authenticated: true,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET CART ERROR:", error);

    return Response.json(
      {
        error: "Unable to load cart",
      },
      { status: 500 }
    );
  }
}


// ==========================================
// SAVE USER CART
// ==========================================
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        {
          error: "You must be logged in to save a cart.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const cart = Array.isArray(body?.cart)
      ? body.cart
      : [];

    await connectDB();

    const email = session.user.email
      .toLowerCase()
      .trim();

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          cart,
        },
      },
      {
        new: true,
      }
    ).select("cart");

    if (!user) {
      return Response.json(
        {
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        cart: user.cart || [],
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("SAVE CART ERROR:", error);

    return Response.json(
      {
        error: "Unable to save cart",
      },
      { status: 500 }
    );
  }
}


// ==========================================
// CLEAR USER CART
// ==========================================
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        {
          success: true,
          cart: [],
        },
        { status: 200 }
      );
    }

    await connectDB();

    const email = session.user.email
      .toLowerCase()
      .trim();

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          cart: [],
        },
      }
    );

    return Response.json(
      {
        success: true,
        cart: [],
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("CLEAR CART ERROR:", error);

    return Response.json(
      {
        error: "Unable to clear cart",
      },
      { status: 500 }
    );
  }
}