import clientPromise from "@/libs/mongoConnect";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "@/models/User";
import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

export const authOptions = {
  secret: process.env.SECRET,

  adapter: MongoDBAdapter(clientPromise),

  providers: [
    // -------------------------
    // GOOGLE LOGIN
    // -------------------------
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // -------------------------
    // EMAIL + PASSWORD LOGIN
    // -------------------------
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@example.com",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          const email = credentials?.email?.toLowerCase().trim();
          const password = credentials?.password;

          // Make sure both fields are provided
          if (!email || !password) {
            return null;
          }

          // Connect to MongoDB
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URL);
          }

          // Find user
          const user = await User.findOne({ email });

          // User doesn't exist
          if (!user) {
            return null;
          }

          // User doesn't have a password
          // This can happen for Google-only accounts
          if (!user.password) {
            return null;
          }

          // Compare entered password with bcrypt hash
          const passwordOk = await bcrypt.compare(
            password,
            user.password
          );

          if (!passwordOk) {
            return null;
          }

          // Successful login
          return {
            id: user._id.toString(),
            name: user.name || "",
            email: user.email,
          };
        } catch (error) {
          console.error(
            "Credentials authentication error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  // -------------------------
  // SESSION
  // -------------------------
  session: {
    strategy: "jwt",
  },

  // -------------------------
  // CALLBACKS
  // -------------------------
  callbacks: {
    // -------------------------
    // JWT CALLBACK
    // -------------------------
    async jwt({ token, user }) {
      /*
       * When the user first logs in, save their
       * information into the JWT.
       */
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      /*
       * If the JWT already exists but doesn't have
       * a name, fetch the latest name from MongoDB.
       *
       * This is important for existing users such as
       * Prashant whose name already exists in the
       * User collection.
       */
      if (!token.name && token.email) {
        try {
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URL);
          }

          const dbUser = await User.findOne({
            email: token.email.toLowerCase().trim(),
          }).lean();

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.name = dbUser.name || "";
            token.email = dbUser.email;
          }
        } catch (error) {
          console.error(
            "JWT user lookup error:",
            error
          );
        }
      }

      return token;
    },

    // -------------------------
    // SESSION CALLBACK
    // -------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;

        /*
         * Use the name stored in MongoDB/JWT.
         *
         * Existing user:
         * "Prashant Choudhary"
         *
         * New user:
         * whatever name they entered during registration
         */
        session.user.name = token.name || "User";
      }

      return session;
    },
  },

  // -------------------------
  // PAGES
  // -------------------------
  pages: {
    signIn: "/login",
  },
};

// -------------------------
// ADMIN CHECK
// -------------------------
export async function isAdmin() {
  try {
    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email
      ?.toLowerCase()
      .trim();

    if (!userEmail) {
      return false;
    }

    // Make sure MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URL);
    }

    // Check the actual User collection
    const user = await User.findOne({
      email: userEmail,
    });

    if (!user) {
      return false;
    }

    return user.admin === true;
  } catch (error) {
    console.error("Admin check error:", error);

    return false;
  }
}

// -------------------------
// NEXTAUTH HANDLER
// -------------------------
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };