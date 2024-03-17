const express = require("express");
const app = express();
const fs = require("fs");
const tesseReader = require("./tesseReaderService/tesseReader.js");
const cors = require("cors");
const multer = require("multer");
const logger = require("./logger/logger.js");
const modelController = require("./agent/ModelController.js");
const tesseController = require("./tesseReaderService/tesseController.js");
const stripeController = require("./paymentService/stripeController.js");
const { db } = require("./firebase/firebase.js");
//const sleep = require("system-sleep");
const {
  storeEditedCompletions,
  storeDataForGenServices,
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
const targetUrl = "http://127.0.0.1:8081";
const proxy = httpProxy.createProxy({
  changeOrigin: true,
  target: targetUrl,
});

//** NODE HTTP-PROXY ***/
const httpProxy2 = require("http-proxy");
const targetAdd = "http://127.0.0.1:8087";
const proxyTwo = httpProxy.createProxy({
  changeOrigin: true,
  target: targetAdd,
});

//*** MULTER ***/
const storage = multer.diskStorage({
  destination: "./Documents/Uploads",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const altStorage = multer.diskStorage({
  destination: "./Documents/Complaints",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const uploadComp = multer({ storage: altStorage });

//POST NEW COMPLAINT DOC -> py docConvert pdf-png
app.post(
  "/v1/parse-new-compdoc",
  uploadComp.single("file"),
  function (req, res) {
    const id = req.file.originalname.split(".")[0];
    const isComplaint = true;
    const clientPosition = "plaintiff";
    try {
      req.url = req.url.replace(
        "/v1/parse-new-compdoc",
        `/parse-new-complaint/${id}`
      );
      proxy.web(req, res, {
        function(err) {
          console.log("Proxy error:", err);
        },
      });
    } catch (err) {
      logger.error({ level: "error", message: "err", err });
      console.log("Error at /v1/gen-disc-request", err);
      res.send(err);
    }
    res.sendStatus(200);
  }
);

/*
 *  POST new discv request => docConvert - pdf to png
 */

app.post("/v1/parse-new-req-doc", upload.single("file"), function (req, res) {
  const id = req.file.originalname.split(".")[0];

  try {
    req.url = req.url.replace(
      "/v1/parse-new-req-doc",
      `/parse-new-disc-req/${id}`
    );
    proxy.web(req, res, {
      function(err) {
        console.log("Proxy error:", err);
      },
    });
  } catch (err) {
    logger.error({ level: "error", message: "err", err });
    console.log("Error at /v1/gen-disc-request", err);
    res.send(err);
  }

  res.sendStatus(200);
});

//make outgoing requests from comp
app.post(
  "/v1/generate-outgoing-disc-req/:docId/:clientPosition",
  async (req, res) => {
    const { docId, clientPosition } = req.params;

    const isComplaint = true;
    try {
      const res = await tesseController.executeReadWriteActions(
        docId,
        isComplaint,
        clientPosition
      );
      //return res;
    } catch (err) {
      console.log("err in make-outgoing-requests", err);
    }
    res.sendStatus(200);
  }
);

//make resp to incoming requests from req doc
app.post(
  "/v1/generate-disc-responses/:docId/:clientPosition",
  async (req, res) => {
    const { docId, clientPosition } = req.params;
    console.log("generate-disc-responses ------------------>");
    const isComplaint = false;
    try {
      const res = await tesseController.executeReadWriteActions(
        docId,
        isComplaint,
        clientPosition
      );
      return res;
    } catch (err) {
      console.log("err in make-outgoing-requests", err);
    }
    res.sendStatus(200);
  }
);

/*
 *  POST to Generate Docx
 */

app.post("/v1/generate-request-docx/:docId", async function (req, res) {
  const { docId } = req.params;
  const data = req.body;
  try {
    req.url = req.url.replace("/v1/generate-request-docx", `/gen-req-docx`);
    proxyTwo.web(req, res, {
      function(err) {
        console.log("Proxy error:", err);
      },
    });
  } catch (err) {
    console.log("generate-request-docx error", err);
  }
});

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
    console.log("Error in create-subscription", error);
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
 *  Generate responses to irregular types
 *  combined-numbered
 */

app.get(
  "/v1/generate-disc-responses-irreg/:docId/:docType/:isRequests",
  async (req, res) => {
    const { docId, docType } = req.params;
    const isRequests = false;
    console.log(
      "hit end point for generate-disc-responses-irreg ===++++++==++=+=+ ----------------------> "
    );
    try {
      const data = await modelController.arrayGenAnswers(
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
 *
 *  GET .docx discovery response
 *
 */

app.get("/v1/get-docx/:docId/:reqType", (req, res) => {
  const { docId } = req.params;
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

app.post("/v1/store-edited-completions", function (req, res) {
  const data = req.body;

  try {
    storeEditedCompletions(data);
  } catch (err) {
    console.log("Error at /v1/store-edited-completions:", err);
  }
  res.end();
});

/*
 *  POST store docx data for gen service
 */

app.post("/v1/store-docx-data/:docId", function (req, res) {
  const { docId } = req.params;
  const data = req.body;
  console.log("data", data);
  try {
    storeDataForGenServices(docId, data);
  } catch (err) {
    console.log("Error at /v1/store-edited-completions:", err);
  }
  res.end();
});

/*
 *
 *  Client GET parsed requests array
 */

app.get("/v1/get-parsed-requests/:docId/:docType", (req, res) => {
  const { docId, docType } = req.params;

  try {
    res.sendFile(`${docId}-jbk-parsedRequests.json`, {
      root: `${rootDir}/ax3Services/Documents/Requests/${docType}/${docId}/`,
    });
  } catch (err) {
    console.log("err", err);
  }
});

/*
 *  Client GET completions - (responses to) incoming requests
 */

app.get("/v1/get-completions/:docId/:docType", (req, res) => {
  const { docId, docType } = req.params;
  try {
    res.sendFile(`${docId}-jbk-responses.json`, {
      root: `./Documents/Responses/${docType}/${docId}/`,
    });
  } catch (err) {
    console.log("err", err);
  }
});

/*
 *  Client GET completions - requests outgoing
 */

app.get("/v1/get-outgoing-requests/:docId/:docType", (req, res) => {
  const { docId, docType } = req.params;
  try {
    res.sendFile(`${docId}-jbk-requests-out.json`, {
      root: `./Documents/RequestsOut/${docId}/`,
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

app.listen(port);

//const docId = "5223d27b-035c-435a-92cb-ec2156aeb4e4";
//const reqType = "interrogatories";
//const isRequests = true;
//modelController.testSaveFunction(docId, reqType, isRequests);

/*

const rogs = [
  {
    type: "interrogatories",
    requests: [
      {
        requestId: "a519c891-e243-4559-a695-920c8961450c",
        text: "request for production) documents, set onevs. ) to dismissany defendant, and does 1-5 ) date: ,2011) time:defendant. ) dept.:proponding party: any defendantresponding party: any plaintiffset no.: oneto: plaintiff, , and his attorneys of record.please take notice that pursuant to california code of civil procedure sections2031.010-2031.510, et. seq., plaintiff/cross-defendant [name] (“plaintiff”’) demands that on[date] at [time] defendants [name]. (collectively the “defendants” or “responding party”and/or individually “defendant” or “responding party”) produce the following documents forinspection and copying at [location]. the production and inspection shall continue from day to1of|",
      },
      {
        requestId: "520074b5-1058-49ab-a987-a90cab7fdc76",
        text: "request for production of documents, set one",
      },
      {
        requestId: "56463698-111c-421e-b7d1-ee520ac72b42",
        text: "request for production no. 1.any and all documents, tangible things and other items that support, refute or inany way relate to your denial of the allegations in paragraph 3 of the complaint.",
      },
      {
        requestId: "dba8af21-cccc-4ff2-8654-8175bfff2652",
        text: "request for production no. 2.any and all documents, tangible things and other items that support, refute or inany way relate to your denial of the allegations in paragraph 6 of the complaint.",
      },
      {
        requestId: "c9d1c954-a1cf-4274-a021-6d3064d2373d",
        text: "request for production no. 3.any and all documents, tangible things and other items that support, refute or inany way relate to your denial of the allegation in paragraph 7 of the complaint.",
      },
      {
        requestId: "8255516f-ad8d-4034-97d3-06f63075e847",
        text: "request for production no. 4.any and all documents given to defendant by plaintiff, including butnot limited to commission statements.",
      },
      {
        requestId: "86990e33-28fb-4adc-9615-3380518de13e",
        text: "request for production no. 5.any and all documents that constitute or relate to documents thatdefendant gave or submitted to plaintiff.7",
      },
      {
        requestId: "910d9442-3607-48d5-8d0e-b1585a695132",
        text: "request for production no. 6.any and all documents related to requests by defendant forreimbursement for expenses from plaintiff.",
      },
      {
        requestId: "7323119f-6510-4435-8d79-ff4af589d10d",
        text: "request for production no. 7.any and all documents relating to sales made by defendant on behalfof plaintiff.",
      },
      {
        requestId: "8221ccc5-5f36-495c-8d7f-0f8781fce64e",
        text: "request for production no. 8.defendant’s current customer list.",
      },
      {
        requestId: "2b6f218d-9b02-4a32-a9ef-36a60fa00ca3",
        text: "request for production no. 9.any and all documents that support, refute or relate to any and allaffirmative defenses in your answer.",
      },
      {
        requestId: "964b677b-576a-4360-b12c-cde65d0fcca2",
        text: "request for production no. 10.the computer and any related items, including any and all storage media andmemory devices, that contain any information, documents and/or files requested in any ofthese requests for production.",
      },
      {
        requestId: "f2097d5b-b3ad-433d-94ae-937a1e2febb1",
        text: "request for production no. 11.any and all computer backup media containing information and/or files requested inthese requests for production.",
      },
      {
        requestId: "6ddb6b31-8e94-4615-bce5-b2baebeb522e",
        text: "request for production no. 12.any and all documents sufficient to determine all telephone calls, e-mails orfacsimile transmissions between defendant and [name] between [date] and [date].dated: [date]8",
      },
    ],
  },
];
*/
