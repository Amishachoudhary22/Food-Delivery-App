import {isAdmin} from "@/app/api/auth/[...nextauth]/route";
import {MenuItem} from "@/models/MenuItem";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Data received:", data); // Debugging log

    // Check if `category` is a valid ObjectId
    if (!data.category || !mongoose.isValidObjectId(data.category)) {
      return new Response("Invalid category ID", { status: 400 });
    }

    // Proceed to create the menu item if validation passes
    const menuItem = await MenuItem.create(data);
    return new Response(JSON.stringify(menuItem), { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return new Response(`Error creating menu item: ${error.message}`, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    }
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    return new Response("Database connection failed", { status: 500 });
  }
  if (await isAdmin()) {
    const {_id, ...data} = await req.json();
    await MenuItem.findByIdAndUpdate(_id, data);
  }
  return Response.json(true);
}

export async function GET() {
  mongoose.connect(process.env.MONGO_URL);
  return Response.json(
    await MenuItem.find()
  );
}

export async function DELETE(req) {
  mongoose.connect(process.env.MONGO_URL);
  const url = new URL(req.url);
  const _id = url.searchParams.get('_id');
  if (await isAdmin()) {
    await MenuItem.deleteOne({_id});
  }
  return Response.json(true);
}