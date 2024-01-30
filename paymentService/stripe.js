// stripe.js
const {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");
const { db } = require("../firebase/firebase.js");

async function handlePaymentFailure(paymentData) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", paymentData.customer_email));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("No user found with the email:", paymentData);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);

    await updateDoc(userRef, {
      subscriptionId: null,
      customerId: null,
    });

    console.log("User data updated for email:", paymentData.customer_email);
  } catch (error) {
    console.error("Error updating user data:", error);
  }
}

async function handleSubscriptionDeletion(
  stripeCustomer,
  stripeSubscription,
  stripe
) {
  try {
    let customer_email = stripeCustomer.email;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", customer_email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No user found with the email:", customer_email);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);

    const userData = userDoc.data();
    //get the user's subscription ID and customer ID
    const subscriptionId = userDoc.data().subscriptionId;
    const customerId = userDoc.data().customerId;

    if (!subscriptionId) {
      return null;
    }

    //update the user's subscription data
    await updateDoc(userRef, {
      subscriptionId: null,
      customerId: null,
    });

    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    //res.status(400).send({ error: { message: error.message } });
  }
}

module.exports = {
  handlePaymentFailure,
  handleSubscriptionDeletion,
};
