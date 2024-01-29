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
  async createNewSubscription(customerData, type, token) {
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
  }
}

module.exports = new StripeController();
