const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const logger = require("./logger/logger.js");
const modelController = require("./agent/ModelController.js");
const stripeController = require("./paymentService/stripeController.js");
const { db } = require("./firebase/firebase.js");
const {
  storeEditedCompletions,
} = require("./storageService/storeEditedCompletion.js");
const {
  deleteDocument,
  deleteFolderAndContents,
  cleanupGenFolderAndContents,
} = require("./storageService/deleteDirOrDoc.js");
const {
  handlePaymentFailure,
  handleSubscriptionDeletion,
} = require("./paymentService/stripe.js");
const { collection, query, where, getDocs } = require("firebase/firestore");

//*** STRIPE ***/
const Stripe = require("stripe");
const { stripeAPIKey, stripeWebhooksKey } = require("./firebase/secrets.js");
const stripe = Stripe(stripeAPIKey);
// Secret for Stripe webhooks
const endpointSecret = stripeWebhooksKey;

//** NODE HTTP-PROXY ***/
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxy();

//*** MULTER ***/
const storage = multer.diskStorage({
  destination: "./Documents/Uploads",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const altStorage = multer.diskStorage({
  destination: "./Documents/PleadingUploads",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const uploadComp = multer({ storage: altStorage });

/*
 *  POST new complaint .pdf => gen discovery req
 */

app.post(
  "/v1/gen-disc-request",
  uploadComp.single("file"),
  function (req, res) {
    const id = req.file.originalname.split(".")[0];
    console.log(
      "------------------------------------------------------------------------------->filename",
      id
    );
    try {
      //req.headers["Content-Type"] = "application/json";
      //req.headers["accept"] = "application/json";
      //req.body = JSON.stringify({ filename: filename });
      proxy.web(req, res, {
        target: `http://127.0.0.1:8081/`,
        function(err) {
          console.log("Proxy error:", err);
        },
      });
      // logger.log({ level: "info", message: "req.file", file });
    } catch (err) {
      logger.error({ level: "error", message: "err", err });
      console.log("Error at /v1/gen-disc-request", err);
    }
  }
);

const rootDir =
  process.env.NODE_ENV === "development"
    ? "/Users/kjannette/workspace/ax3"
    : "/var/www";

//*** EXPRESS ***/

const port = 3001;

var corsOptions = {
  AccessControlAllowOrigin: "*",
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/*
 *  Client POST create stripe subscription, make payment
 */
app.post("/create-subscription", async (req, res) => {
  const { planType, additionalAccounts, isAnnual, customerData, token } =
    req.body;
  try {
    const sub = await stripeController.createNewSubscription(
      planType,
      additionalAccounts,
      isAnnual,
      customerData,
      token
    );

    const subscriptionCreated = sub.subscription.created;
    const subscriptionPeriodStart = sub.subscription.current_period_start;
    const subscriptionPeriodEnd = sub.subscription.current_period_end;
    const subscriptionId = sub.subscription.id;
    const customerId = sub.customer.customerId;

    res.send({
      subscriptionCreated,
      subscriptionPeriodStart,
      subscriptionPeriodEnd,
      subscriptionId,
      customerId,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: error.message } });
  }
});

/*
 *  Client POST create stripe subscription, make payment
 */
app.post("/new-payment-intent", async (req, res) => {
  const { planType, additionalAccounts, isAnnual, customerData, token } =
    req.body;

  const userAgent = req.headers["user-agent"];
  try {
    const payIntent = await stripeController.createNewPaymentIntent(
      customerData,
      token,
      userAgent
    );
    res.send({
      payIntent,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: { message: error.message } });
  }
});

/*
 *  Client POST for cancelling a subscription
 */
app.post("/cancel-subscription", async (req, res) => {
  const { appUserId } = req.body;
  try {
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

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: { message: error.message } });
  }
});

/*
 *  Client POST - Stripe webhook(s)
 */

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const { type } = request.body.type;
    switch (request.body.type) {
      case "customer.subscription.deleted":
        const subscription = request.body.data.object;

        //get stripe customer
        const stripeCustomer = await stripe.customers.retrieve(
          subscription.customer
        );

        await handleSubscriptionDeletion(stripeCustomer, subscription, stripe);
        break;
        x;
      case "invoice.payment_failed":
        const paymentIntent = request.body.data.object;
        await handlePaymentFailure(paymentIntent);
        break;
      default:
        console.log(`Unhandled event type`);
    }
    response.status(200).send();
  }
);

/*
 *  POST new discv request .pdf => docParser parse into array
 */

app.post("/parseNewDoc", upload.single("file"), function (req, res) {
  const file = req.file;

  console.log("file", file);
  try {
    logger.log({ level: "info", message: "req.file", file });
  } catch (err) {
    logger.error({ level: "error", message: "err", err });
    res.send("error:", err);
  }
  res.sendStatus(200);
});

/*
 *  Generate responses to regular types:
 *  interrogatories, admissions, production
 */

app.get(
  "/genResponseFromArray/:docId/:docType/:isRequests",
  async (req, res) => {
    const { docId, docType } = req.params;
    const isRequests = false;
    try {
      const data = await modelController.arrayGenAnswers(
        docId,
        docType,
        isRequests
      );
      res.send(data);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
);

/*
 *  Generate responses to irregular types
 *  combined-numbered
 */

app.get(
  "/genResponseFromArrayCombined/:docId/:docType/:isRequests",
  async (req, res) => {
    const { docId, docType } = req.params;
    const isRequests = false;
    try {
      const data = await modelController.arrayGenAnswersCombined(
        docId,
        docType,
        isRequests
      );
      res.send(data);
    } catch (error) {
      console.log(error);
    }
  }
);

/*
 *  POST to Generate Docx
 */

app.post("/genDocx/:docId/:reqType", async function (req, res) {
  const { docId, reqType } = req.params;
  const data = req.body;
  try {
    const defaultMjsExport = (
      await import(
        `${rootDir}/ax3Services/docGenService/responseHeaderGenerator.mjs`
      )
    ).default;
    defaultMjsExport(docId, reqType, data);
    res.end("doc created");
  } catch (err) {
    console.log(err);
  }
});

/*
 *
 *  GET .docx discovery response
 *
 */

app.get("/getDocx/:docId/:reqType", (req, res) => {
  const { docId, reqType } = req.params;
  res.sendFile(`${docId}.docx`, {
    root: `${rootDir}/ax3Services/Docxfinal/`,
  });
});

/*
 *  Cleanup docx working files (temp workaround)
 */

app.get("/cleanUpDocx/:docId/:reqType", (req, res) => {
  const { docId, reqType } = req.params;
  try {
    cleanupGenFolderAndContents(docId, reqType);
    res.end("doc cleanup complete");
  } catch (err) {
    console.log(err);
  }
});

/*
 *  POST store user-edited completions
 */

app.post("/storeeditedcompletions", function (req, res) {
  const data = req.body;
  try {
    storeEditedCompletions(data);
  } catch (err) {
    console.log("Error:", err);
  }
  res.end();
});

/*
 *
 *  Client GET parsed requests array
 */

app.get("/getParsedRequests/:docId/:docType", (req, res) => {
  const { docId, docType } = req.params;
  let folder;
  if (docType === "interrogatories") {
    folder = "Parsedrogs";
  } else if (docType === "admissions") {
    folder = "Parsedadmit";
  } else if (docType === "production") {
    folder = "Parsedprod";
  } else if (docType === "combined-numbered") {
    folder = "Parsedcombined";
  }
  console.log(
    "dir in getParsedRequests",
    `${rootDir}/ax3Services/Documents/Requests/${folder}/${docId}/`
  );
  try {
    res.sendFile(`${docId}-jbk-parsedRequests.json`, {
      root: `${rootDir}/ax3Services/Documents/Requests/${folder}/${docId}/`,
    });
  } catch (err) {
    console.log("err", err);
  }
});

/*
 *  Client GET completions
 */

app.get("/completions/:docId/:docType", (req, res) => {
  const { docId, docType } = req.params;
  let folder;

  if (docType === "interrogatories") {
    folder = `Rogresp`;
  } else if (docType === "production") {
    folder = `Prodresp`;
  } else if (docType === "admissions") {
    folder = `Admitresp`;
  } else if (docType === "combined-numbered") {
    folder = `Combinedresp`;
  }

  try {
    res.sendFile(`${docId}-jbk-responses.json`, {
      root: `./Documents/Responses/${folder}/${docId}/`,
    });
  } catch (err) {
    console.log("err", err);
  }
});

/*
 *  Client POST to delete a request or response document
 */

app.post("/deleteDoc/:docId/:docType/:respGens", (req, res) => {
  const { docId, docType, respGens } = req.params;
  try {
    deleteFolderAndContents(docId, docType, respGens);
  } catch (err) {
    console.log("err", err);
  }
});

console.log("app running on port", port);
console.log("rootDir", rootDir);
console.log(
  "`${rootDir}/ax3Services/Documents/Requests/`",
  `${rootDir}/ax3Services/Documents/Requests/`
);
app.listen(port);
