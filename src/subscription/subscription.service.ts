import { Session } from "node:inspector";
import config from "../config";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      //new subscribtion
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });

    return session.url;
  });

  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckOutCompleted(event.data.object)
      //Occurs when a Checkout Session has been successfully completed.
      break;
    case "customer.subscription.updated":
      //Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).

      break;
    case "customer.subscription.deleted":
      //Occurs whenever a customer’s subscription ends.
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
};

const getPeriodEnd = (paylaod : Stripe.Subscription) =>{

  const currentPeriodEndInMilliSeconds = paylaod.items.data[0]?.current_period_end!;

  const currentPeriodEnd = new Date(currentPeriodEndInMilliSeconds * 1000);

  return currentPeriodEnd
}


const handleCheckOutCompleted = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    throw new Error("Webhook Failed");
  }

  const stripeSubscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const currentPeriodEnd = getPeriodEnd(stripeSubscription)

  await prisma.subscription.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      status: "ACTIVE",
      currentPeriodEnd,
    },
  });
};


export const subscriptionServices = {
  createCheckoutSession,
  handleWebhook,
};
