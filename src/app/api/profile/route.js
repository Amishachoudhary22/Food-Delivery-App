import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {User} from "@/models/User";
import {UserInfo} from "@/models/UserInfo";
import mongoose from "mongoose";
import {getServerSession} from "next-auth";

export async function PUT(req) {
  mongoose.connect(process.env.MONGO_URL);

  const data = await req.json();

  const {
    _id,
    name,
    image,
    ...otherUserInfo
  } = data;

  let filter = {};

  if (_id) {
    filter = { _id };
  } else {
    const session =
      await getServerSession(authOptions);

    const email =
      session?.user?.email
        ?.toLowerCase()
        .trim();

    if (!email) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    filter = { email };
  }

  const user = await User.findOne(filter);

  if (!user) {
    return Response.json(
      { error: "User not found." },
      { status: 404 }
    );
  }

  await User.updateOne(
    filter,
    {
      name,
      image,
    }
  );

  await UserInfo.findOneAndUpdate(
    { email: user.email },
    otherUserInfo,
    {
      upsert: true,
    }
  );

  const updatedUser =
    await User.findOne(filter).lean();

  return Response.json({
    success: true,
    user: updatedUser,
  });
}

export async function GET(req) {
  mongoose.connect(process.env.MONGO_URL);

  const url = new URL(req.url);
  const _id = url.searchParams.get('_id');

  let filterUser = {};
  if (_id) {
    filterUser = {_id};
  } else {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return Response.json({});
    }
    filterUser = {email};
  }

  const user = await User.findOne(filterUser).lean();
  const userInfo = await UserInfo.findOne({email:user.email}).lean();

  return Response.json({...user, ...userInfo});

}

