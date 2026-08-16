import { model, models, Schema } from "mongoose";

const CartProductSchema = new Schema(
  {
    _id: {
      type: String,
    },

    name: {
      type: String,
    },

    description: {
      type: String,
    },

    basePrice: {
      type: Number,
    },

    image: {
      type: String,
    },

    category: {
      type: String,
    },

    size: {
      type: Schema.Types.Mixed,
      default: null,
    },

    extras: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: false,
  }
);


const UserSchema = new Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
    },

    phone: {
      type: String,
    },

    streetAddress: {
      type: String,
    },

    Zipcode: {
      type: String,
    },

    city: {
      type: String,
    },

    Country: {
      type: String,
    },

    admin: {
      type: Boolean,
      default: false,
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    // =====================================
    // USER CART
    // =====================================
    cart: {
      type: [CartProductSchema],
      default: [],
    },
  },

  {
    timestamps: true,
  }
);


export const User =
  models?.User || model("User", UserSchema);