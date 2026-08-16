import { Order } from "@/models/Order";
import mongoose from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK);

async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}

export async function POST(req) {
  try {
    const signature =
      req.headers.get("stripe-signature");

    if (!signature) {
      return Response.json(
        {
          error: "Missing Stripe signature.",
        },
        {
          status: 400,
        }
      );
    }

    const webhookSecret =
      process.env.STRIPE_SIGN_SECRET;

    if (!webhookSecret) {
      console.error(
        "STRIPE_SIGN_SECRET is missing."
      );

      return Response.json(
        {
          error:
            "Stripe webhook secret is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * IMPORTANT:
     * We must use the raw request body for
     * Stripe signature verification.
     */
    const rawBody = await req.text();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error(
        "STRIPE WEBHOOK SIGNATURE ERROR:",
        error.message
      );

      return Response.json(
        {
          error: "Invalid Stripe webhook signature.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "STRIPE WEBHOOK:",
      event.type
    );

    /*
     * Payment completed
     */
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const checkoutSession =
        event.data.object;

      const orderId =
        checkoutSession?.metadata?.orderId;

      const paymentStatus =
        checkoutSession?.payment_status;

      if (!orderId) {
        console.error(
          "Stripe webhook: orderId missing."
        );

        return Response.json({
          received: true,
        });
      }

      if (paymentStatus === "paid") {
        await connectDB();

        await Order.updateOne(
          {
            _id: orderId,
          },
          {
            $set: {
              paid: true,
            },
          }
        );

        console.log(
          `Order ${orderId} marked as PAID`
        );
      }
    }

    return Response.json({
      received: true,
    });

  } catch (error) {
    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    return Response.json(
      {
        error: "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}
