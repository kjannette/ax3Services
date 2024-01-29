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
      "------------->planType, additionalAccounts, isAnnual",
      planType,
      additionalAccounts,
      isAnnual
    );
    const tokenId = token.id;
    let priceId;
    let addId;
    let items;

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

    items = [{ price: priceId }];

    if (planType === "partner" && isAnnual === false) {
      if (additionalAccounts === 1) {
        addId = "price_1OdIcqBi8p7FeGFrcKhFGudX";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1OdIvYBi8p7FeGFrLhvk1mwo";
        items.push({ price: addId });
      }
    } else if (planType === "partner" && isAnnual === true) {
      if (additionalAccounts === 1) {
        addId = "price_1OdIunBi8p7FeGFrOJjULnA0";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1OdJ0pBi8p7FeGFrFrrXjfwA";
        items.push({ price: addId });
      }
    }

    if (planType === "seniorPartner" && isAnnual === false) {
      if (additionalAccounts === 1) {
        addId = "price_1OdJ1XBi8p7FeGFrZVHDlSGH";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1OdJ3vBi8p7FeGFr47ZbQQN6";
        items.push({ price: addId });
      } else if (additionalAccounts === 3) {
        addId = "price_1OdJ50Bi8p7FeGFrFB8wTpZu";
        items.push({ price: addId });
      } else if (additionalAccounts === 4) {
        addId = "price_1OdJ6uBi8p7FeGFrdUhzYaGC";
        items.push({ price: addId });
      } else if (additionalAccounts === 5) {
        addId = "price_1OdJ88Bi8p7FeGFrSwpR5r4Z";
        items.push({ price: addId });
      } else if (additionalAccounts === 6) {
        addId = "price_1OdJ9CBi8p7FeGFrTQNy2YVd";
        items.push({ price: addId });
      } else if (additionalAccounts === 7) {
        addId = "price_1OdJAIBi8p7FeGFrZyWHIlYf";
        items.push({ price: addId });
      } else if (additionalAccounts === 8) {
        addId = "price_1OdJCzBi8p7FeGFriBy3OCso";
        items.push({ price: addId });
      } else if (additionalAccounts === 9) {
        addId = "price_1OddLzBi8p7FeGFrzeVmj4fG";
        items.push({ price: addId });
      } else if (additionalAccounts === 10) {
        addId = "price_1OddNUBi8p7FeGFraRX3ypOK";
        items.push({ price: addId });
      }
    } else if (planType === "seniorPartner" && isAnnual === true) {
      if (additionalAccounts === 1) {
        addId = "price_1OdJ3EBi8p7FeGFr6371XcAi";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1OdJ4PBi8p7FeGFrgW7aKHwZ";
        items.push({ price: addId });
      } else if (additionalAccounts === 3) {
        addId = "price_1OdJ6IBi8p7FeGFrItKkXCeM";
        items.push({ price: addId });
      } else if (additionalAccounts === 4) {
        addId = "price_1OdJ7YBi8p7FeGFrCC6AulEY";
        items.push({ price: addId });
      } else if (additionalAccounts === 5) {
        addId = "price_1OdJ8lBi8p7FeGFr6d8z3afK";
        items.push({ price: addId });
      } else if (additionalAccounts === 6) {
        addId = "price_1OdJ9kBi8p7FeGFrxXTG7s20";
        items.push({ price: addId });
      } else if (additionalAccounts === 7) {
        addId = "price_1OdJBJBi8p7FeGFrc0F6ByO5";
        items.push({ price: addId });
      } else if (additionalAccounts === 8) {
        addId = "price_1OdJDbBi8p7FeGFrbpE4URLd";
        items.push({ price: addId });
      } else if (additionalAccounts === 9) {
        addId = "price_1OddMxBi8p7FeGFraD12KrD4";
        items.push({ price: addId });
      } else if (additionalAccounts === 10) {
        addId = "price_1OddOEBi8p7FeGFrKcFey7PM";
        items.push({ price: addId });
      }
    }
    console.log("items", items);
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
      console.log("StripeController error in createNewSubscription", error);
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
