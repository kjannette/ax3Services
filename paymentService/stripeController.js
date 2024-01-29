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

    let priceId;
    let addId;
    let items;
    console.log(
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>>>additionalAccounts",
      additionalAccounts
    );
    if (planType === "associate" && isAnnual === false) {
      priceId = "price_1OdGLMBi8p7FeGFrr3JN9LB6";
    } else if (planType === "associate" && isAnnual === true) {
      priceId = "price_1OdGN3Bi8p7FeGFr9PM7oD93";
    } else if (planType === "partner" && isAnnual === false) {
      priceId = "price_1OdGO8Bi8p7FeGFrg7EdavjO";
    } else if (planType === "partner" && isAnnual === true) {
      priceId = "price_1OdGPHBi8p7FeGFrNd0hOVro";
    } else if (planType === "seniorPartner" && isAnnual === false) {
      priceId = "price_1OdGRLBi8p7FeGFrVAf7QCdw";
    } else if (planType === "seniorPartner" && isAnnual === false) {
      priceId = "price_1OdGRrBi8p7FeGFr2Zvr7USe";
    }

    const tokenId = token.id;

    if (planType === "partner" && isAnnual === false) {
      if (additionalAccounts === 1) {
        addId = "price_1OdIcqBi8p7FeGFrcKhFGudX";
      } else if (additionalAccounts === 2) {
        addId = "price_1OdIvYBi8p7FeGFrLhvk1mwo";
      }
    } else if (planType === "partner" && isAnnual === true) {
      if (additionalAccounts === 1) {
        addId = "price_1OdIunBi8p7FeGFrOJjULnA0";
      } else if (additionalAccounts === 2) {
        addId = "price_1OdJ0pBi8p7FeGFrFrrXjfwA";
      }
    }

    if (additionalAccounts === 0) {
      items = [{ price: priceId }];
    } else if (additionalAccounts === 1) {
      items = [{ price: priceId }, { price: addId }];
    } else if (additionalAccounts === 2) {
      items = [{ price: priceId }, { price: addId }];
    }
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>>>items", items);
    try {
      // create new customer object
      const customer = await stripe.customers.create({
        ...customerData,
        source: tokenId,
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: items,
        expand: ["latest_invoice.payment_intent"],
      });

      console.log(
        "------------------------------------------------------>subscription",
        subscription
      );
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
