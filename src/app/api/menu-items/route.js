import { isAdmin } from "@/app/api/auth/[...nextauth]/route";
import { MenuItem } from "@/models/MenuItem";
import mongoose from "mongoose";

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}

export async function POST(req) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return Response.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const data = await req.json();

    if (!data.name || !data.name.trim()) {
      return Response.json(
        { error: "Menu item name is required." },
        { status: 400 }
      );
    }

    if (!data.category) {
      return Response.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    const menuItemDoc = await MenuItem.create(data);

    return Response.json(menuItemDoc, { status: 201 });
  } catch (error) {
    console.error("CREATE MENU ITEM ERROR:", error);

    return Response.json(
      {
        error: "Failed to create menu item.",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return Response.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { _id, ...data } = await req.json();

    if (!_id) {
      return Response.json(
        { error: "Menu item ID is required." },
        { status: 400 }
      );
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      _id,
      data,
      { new: true }
    );

    if (!updatedItem) {
      return Response.json(
        { error: "Menu item not found." },
        { status: 404 }
      );
    }

    return Response.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("UPDATE MENU ITEM ERROR:", error);

    return Response.json(
      {
        error: "Failed to update menu item.",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const menuItems = await MenuItem.find().sort({
      createdAt: 1,
    });

    return Response.json(menuItems, { status: 200 });
  } catch (error) {
    console.error("GET MENU ITEMS ERROR:", error);

    return Response.json(
      { error: "Failed to fetch menu items." },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return Response.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const _id = url.searchParams.get("_id");

    if (!_id) {
      return Response.json(
        { error: "Menu item ID is required." },
        { status: 400 }
      );
    }

    const deletedItem = await MenuItem.findByIdAndDelete(_id);

    if (!deletedItem) {
      return Response.json(
        { error: "Menu item not found." },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Menu item deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE MENU ITEM ERROR:", error);

    return Response.json(
      {
        error: "Failed to delete menu item.",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}