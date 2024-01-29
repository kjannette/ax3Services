const Stripe = require("stripe");
const { stripeAPIKey, stripeWebhooksKey } = require("../secrets.js");
const {
  handlePaymentFailure,
  handleSubscriptionDeletion,
} = require("./stripe.js");
const stripe = Stripe(stripeAPIKey);

// Secret for Stripe webhooks
const endpointSecret = stripeWebhooksKey;

class StripeController {
  async createNewSubscription(
    planType,
    additionalAccounts,
    isAnnual,
    customerData,
    token
  ) {
    console.log(
      "planType, additionalAccounts, isAnnual",
      planType,
      additionalAccounts,
      isAnnual
    );
    const monthlyPriceId = "price_1ObShsBi8p7FeGFrCV3Ox5Mn";
    const yearlyPriceId = "placeholder";
    const tokenId = token.id;

    try {
      // create new customer object
      const customer = await stripe.customers.create({
        ...customerData,
        source: tokenId,
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: type === "monthly" ? monthlyPriceId : yearlyPriceId }],
        expand: ["latest_invoice.payment_intent"],
      });

      //await updateUserSubscriptionData(customer.id, subscription.id);
      // maybe want to add this to the firebase DB
      console.log("subscription", subscription);
      return subscription;
    } catch (error) {
      console.log(
        "StripeController rror creating subscription in createNewSubscription",
        error
      );
    }
  }

  async cancelSubscription(appUserId) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("appUserId", "==", appUserId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No user found with the email:", appUserId);
      return;
    }
    const userDoc = querySnapshot.docs[0];

    //get the user's subscription ID and customer ID
    const subscriptionId = userDoc.data().subscriptionId;

    const deletedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );
    return deletedSubscription;
  }

  async stripeWebhook(type, subscription) {
    switch (type) {
      case "customer.subscription.deleted":
        const subscription = request.body.data.object;

        //get stripe customer
        const stripeCustomer = await stripe.customers.retrieve(
          subscription.customer
        );

        await handleSubscriptionDeletion(stripeCustomer, subscription, stripe);
        break;
      case "invoice.payment_failed":
        const paymentIntent = request.body.data.object;
        await handlePaymentFailure(paymentIntent);
        break;
      default:
        console.log(`Unhandled event type`);
    }

    //response.status(200).send();
  }
}

module.exports = new StripeController();
