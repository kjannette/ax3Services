const Stripe = require("stripe");
const { stripeAPIKey, stripeWebhooksKey } = require("../firebase/secrets.js");
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
    const tokenId = token.id;
    let priceId;
    let addId;
    let items;

    if (planType === "associate" && isAnnual === false) {
      priceId = "price_1P7PdTBi8p7FeGFrmzmQ8zlX";
    } else if (planType === "associate" && isAnnual === true) {
      priceId = "price_1P7PlPBi8p7FeGFrpmdPDLiy";
    } else if (planType === "partner" && isAnnual === false) {
      priceId = "price_1P7PnpBi8p7FeGFrZOPRgDtL";
    } else if (planType === "partner" && isAnnual === true) {
      priceId = "price_1P7PqDBi8p7FeGFr1BhUJm8Q";
    } else if (planType === "seniorPartner" && isAnnual === false) {
      priceId = "price_1OdGRLBi8p7FeGFrVAf7QCdw";
    } else if (planType === "seniorPartner" && isAnnual === true) {
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

    items = [{ price: priceId }];

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
    }

    if (planType === "seniorPartner" && isAnnual === true) {
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

      const obj = { subscription, customer: { customerId: customer.id } };
      return obj;
    } catch (error) {
      console.log("StripeController error in createNewSubscription", error);
    }
  }

  async createNewPaymentIntent(customerData, token, userAgent) {
    const tokenId = token.id;
    try {
      const customer = await stripe.customers.create({
        ...customerData,
        source: tokenId,
      });

      const paymentIntent = await stripe.paymentIntents.create({
        confirm: true,
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        payment_method: token.card.id,
        mandate_data: {
          customer_acceptance: {
            type: "online",
            online: {
              ip_address: token.client_ip,
              user_agent: userAgent,
            },
          },
        },
        return_url: "https://www.novodraft.ai/dashboard",
        currency: "usd",
        amount: 59 * 100,
      });

      const obj = { paymentIntent, customer: { customerId: customer.id } };
      return obj;
    } catch (error) {
      console.log("StripeController error in createNewPaymentIntent", error);
      return error;
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

/*

STRIPE TEST MODE PRICE CODES

    items = [{ price: priceId }];
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
    } else if (planType === "seniorPartner" && isAnnual === true) {
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
    }

    if (planType === "seniorPartner" && isAnnual === true) {
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

*/

/*

STRIPE PROD PRICE CODES


    if (planType === "associate" && isAnnual === false) {
      priceId = "price_1OgasxBi8p7FeGFrjrF7VNAk";
    } else if (planType === "associate" && isAnnual === true) {
      priceId = "price_1OgatkBi8p7FeGFrfwzALYhR";
    } else if (planType === "partner" && isAnnual === false) {
      priceId = "price_1Ogb1uBi8p7FeGFrk9DFQOo0";
    } else if (planType === "partner" && isAnnual === true) {
      priceId = "price_1Ogb20Bi8p7FeGFrJDCwuefJ";
    } else if (planType === "seniorPartner" && isAnnual === false) {
      priceId = "price_1Ogb2VBi8p7FeGFrFjIyL8eW";
    } else if (planType === "seniorPartner" && isAnnual === true) {
      priceId = "price_1Ogb2gBi8p7FeGFrlTQ6xnoj";
    }

    if (planType === "partner" && isAnnual === false) {
      if (additionalAccounts === 1) {
        addId = "price_1Ogb5SBi8p7FeGFrXh5oQ1xL";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1Ogb5dBi8p7FeGFr0Qb7NMIs";
        items.push({ price: addId });
      }
    } else if (planType === "partner" && isAnnual === true) {
      if (additionalAccounts === 1) {
        addId = "price_1Ogb5XBi8p7FeGFrYp3OqBgN";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1Ogb5iBi8p7FeGFrZJga58z2";
        items.push({ price: addId });
      }
    }

    if (planType === "seniorPartner" && isAnnual === false) {
      if (additionalAccounts === 1) {
        addId = "price_1OgbBRBi8p7FeGFrhNNCiKSB";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1OgbBbBi8p7FeGFrDkiHBqjJ";
        items.push({ price: addId });
      } else if (additionalAccounts === 3) {
        addId = "price_1OgbBrBi8p7FeGFr3iaomKIM";
        items.push({ price: addId });
      } else if (additionalAccounts === 4) {
        addId = "price_1OgbC2Bi8p7FeGFrS5mVMoco";
        items.push({ price: addId });
      } else if (additionalAccounts === 5) {
        addId = "price_1OgbCCBi8p7FeGFrsCDdUtv0";
        items.push({ price: addId });
      } else if (additionalAccounts === 6) {
        addId = "price_1OgbCOBi8p7FeGFrYXgF9caV";
        items.push({ price: addId });
      } else if (additionalAccounts === 7) {
        addId = "price_1OgbCaBi8p7FeGFrHs3urIBo";
        items.push({ price: addId });
      } else if (additionalAccounts === 8) {
        addId = "price_1OgbCkBi8p7FeGFrP150586E";
        items.push({ price: addId });
      } else if (additionalAccounts === 9) {
        addId = "price_1OgbCvBi8p7FeGFrhn7Fc6yz";
        items.push({ price: addId });
      } else if (additionalAccounts === 10) {
        addId = "price_1OgbDEBi8p7FeGFrfVkhYgsC";
        items.push({ price: addId });
      }
    }

    if (planType === "seniorPartner" && isAnnual === true) {
      if (additionalAccounts === 1) {
        addId = "price_1OgbBWBi8p7FeGFrBHRfsvSl";
        items.push({ price: addId });
      } else if (additionalAccounts === 2) {
        addId = "price_1OgbBjBi8p7FeGFr2H3WrJHL";
        items.push({ price: addId });
      } else if (additionalAccounts === 3) {
        addId = "price_1OgbBxBi8p7FeGFrZ4P4HXYj";
        items.push({ price: addId });
      } else if (additionalAccounts === 4) {
        addId = "price_1OgbC8Bi8p7FeGFrdSZJ6vHu";
        items.push({ price: addId });
      } else if (additionalAccounts === 5) {
        addId = "price_1OgbCHBi8p7FeGFrDWU3480v";
        items.push({ price: addId });
      } else if (additionalAccounts === 6) {
        addId = "pprice_1OgbCVBi8p7FeGFrj4XYUjvT";
        items.push({ price: addId });
      } else if (additionalAccounts === 7) {
        addId = "price_1OgbCfBi8p7FeGFrDUHZb3fq";
        items.push({ price: addId });
      } else if (additionalAccounts === 8) {
        addId = "price_1OgbCqBi8p7FeGFrcBpwHOei";
        items.push({ price: addId });
      } else if (additionalAccounts === 9) {
        addId = "price_1OgbD0Bi8p7FeGFrSzd969h7";
        items.push({ price: addId });
      } else if (additionalAccounts === 10) {
        addId = "price_1OgbD9Bi8p7FeGFrrxZ4Y6Cl";
        items.push({ price: addId });
      }
    }


    */

/*

        if (planType === "associate" && isAnnual === false) {
      priceId = "price_1OgasxBi8p7FeGFrjrF7VNAk";
    } else if (planType === "associate" && isAnnual === true) {
      priceId = "price_1OgatkBi8p7FeGFrfwzALYhR";
    } else if (planType === "partner" && isAnnual === false) {
      priceId = "price_1Ogb1uBi8p7FeGFrk9DFQOo0";
    } else if (planType === "partner" && isAnnual === true) {
      priceId = "price_1Ogb20Bi8p7FeGFrJDCwuefJ";
    } else if (planType === "seniorPartner" && isAnnual === false) {
      priceId = "price_1Ogb2VBi8p7FeGFrFjIyL8eW";
    } else if (planType === "seniorPartner" && isAnnual === true) {
      priceId = "price_1Ogb2gBi8p7FeGFrlTQ6xnoj";
    }

  */
