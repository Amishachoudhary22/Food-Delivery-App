import { isAdmin } from "@/app/api/auth/[...nextauth]/route";
import { Category } from "@/models/Category";
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

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return Response.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const categoryDoc = await Category.create({
      name: name.trim(),
    });

    return Response.json(categoryDoc, { status: 201 });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return Response.json(
      {
        error: "Failed to create category.",
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

    const { _id, name } = await req.json();

    if (!_id) {
      return Response.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return Response.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedCategory) {
      return Response.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    return Response.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return Response.json(
      {
        error: "Failed to update category.",
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

    const categories = await Category.find().sort({
      createdAt: 1,
    });

    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return Response.json(
      { error: "Failed to fetch categories." },
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
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(_id);

    if (!deletedCategory) {
      return Response.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Category deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return Response.json(
      {
        error: "Failed to delete category.",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}