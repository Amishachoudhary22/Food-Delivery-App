import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MenuItem } from "@/models/MenuItem";
import { Order } from "@/models/Order";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK);

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email;

    if (!userEmail) {
      return Response.json(
        {
          error: "You must be logged in to place an order.",
        },
        {
          status: 401,
        }
      );
    }

    const { cartProducts, address } = await req.json();

    if (!cartProducts || cartProducts.length === 0) {
      return Response.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     * We calculate prices from MongoDB.
     * We do NOT trust prices coming from the browser.
     */

    const stripeLineItems = [];

    for (const cartProduct of cartProducts) {
      const productInfo = await MenuItem.findById(
        cartProduct._id
      );

      if (!productInfo) {
        return Response.json(
          {
            error: `Product "${cartProduct.name}" no longer exists.`,
          },
          {
            status: 400,
          }
        );
      }

      let productPrice = Number(productInfo.basePrice);

      /*
       * Size
       */
      if (cartProduct.size?._id) {
        const size = productInfo.sizes?.find(
          (size) =>
            size._id.toString() ===
            cartProduct.size._id.toString()
        );

        if (!size) {
          return Response.json(
            {
              error: `Invalid size selected for ${productInfo.name}.`,
            },
            {
              status: 400,
            }
          );
        }

        productPrice += Number(size.price);
      }

      /*
       * Extras
       */
      if (
        Array.isArray(cartProduct.extras) &&
        cartProduct.extras.length > 0
      ) {
        for (const selectedExtra of cartProduct.extras) {
          const extra = productInfo.extraIngredientPrices?.find(
            (extra) =>
              extra._id.toString() ===
              selectedExtra._id.toString()
          );

          if (!extra) {
            return Response.json(
              {
                error: `Invalid extra selected for ${productInfo.name}.`,
              },
              {
                status: 400,
              }
            );
          }

          productPrice += Number(extra.price);
        }
      }

      /*
       * Quantity
       */
      const quantity = Number(cartProduct.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return Response.json(
          {
            error: "Invalid product quantity.",
          },
          {
            status: 400,
          }
        );
      }

      stripeLineItems.push({
        quantity,

        price_data: {
          currency: "usd",

          product_data: {
            name: productInfo.name,
          },

          /*
           * Stripe expects the amount in cents.
           */
          unit_amount: Math.round(productPrice * 100),
        },
      });
    }

    /*
     * Create order BEFORE payment.
     *
     * paid remains false until Stripe confirms
     * the payment through the webhook.
     */

    const orderDoc = await Order.create({
      userEmail,
      ...address,
      cartProducts,
      paid: false,
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    /*
     * Remove trailing slash so we don't accidentally
     * create URLs like:
     *
     * http://localhost:3000//orders/...
     */
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    /*
     * Stripe Checkout Session
     */

    const stripeSession =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: stripeLineItems,

        customer_email: userEmail,

        /*
         * After payment Stripe sends the user here.
         *
         * The webhook is still responsible for marking
         * the order as paid.
         */
        success_url:
          `${cleanBaseUrl}/orders/${orderDoc._id}?clear-cart=1&payment=success`,

        cancel_url:
          `${cleanBaseUrl}/cart?canceled=1`,

        metadata: {
          orderId: orderDoc._id.toString(),
        },

        payment_intent_data: {
          metadata: {
            orderId: orderDoc._id.toString(),
          },
        },

        /*
         * $5 delivery fee
         */
        shipping_options: [
          {
            shipping_rate_data: {
              display_name: "Delivery fee",

              type: "fixed_amount",

              fixed_amount: {
                amount: 500,
                currency: "usd",
              },
            },
          },
        ],
      });

    return Response.json({
      url: stripeSession.url,
    });

  } catch (error) {
    console.error(
      "CHECKOUT ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to create Stripe checkout session.",
      },
      {
        status: 500,
      }
    );
  }
}