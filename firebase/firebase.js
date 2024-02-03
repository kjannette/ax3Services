var firebase = require("firebase/app");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  increment,
} = require("firebase/firestore");

const {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
} = require("./secrets");

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/*******************************************************************************
 *
 *  Write determinedDocType to Firebase DB
 *
 ******************************************************************************/

async function updateDB(docId, determinedDocType) {
  await updateDoc(doc(db, "documents", docId), {
    docType: determinedDocType,
  });
}

/*******************************************************************************
 *
 *  Resest Number of Available Docs each month
 *
 ******************************************************************************/

async function getUsers() {
  onSnapshot(collection(db, "users"), (snapshot) => {
    const idArray = [];
    const run = snapshot.docs.map((user) => {
      const userData = user.data();
      console.log("userData", userData);
      const userDate = userData.subscriptionPeriodStart;
      const subStart = new Date(userDate * 1000);
      const subDayOfMonth = subStart.toDateString().split(" ")[2];
      //stringDateconst subDay = stringDate;
      const subDay = Number(subDayOfMonth);

      const today = new Date();
      const thisDay = today.getDate();
      //console.log("subDay, thisDay", subDay, thisDay);
      if (subDay === thisDay) {
        //console.log("user.id =>", user.id);
        const obj = {};
        obj["userId"] = user.id;
        obj["docsPerMonth"] = userData.subscriptionPlan[0].docsAllowedPerMonth;
        obj["docsGenerated"] = userData.docsGenerated;
        const tempCarryOverDocs =
          userData.subscriptionPlan[0].docsAllowedPerMonth -
          userData.docsGenerated;
        let actualCarryOverDocs;
        if (userData.subscriptionPlan[0].docsAllowedPerMonth === 3) {
          if (tempCarryOverDocs >= 2) {
            actualCarryOverDocs = 2;
          } else {
            actualCarryOverDocs = tempCarryOverDocs;
          }
          let tempDocsThisPeriod =
            userData.subscriptionPlan[0].docsAllowedPerMonth +
            actualCarryOverDocs;
          const docsThisPeriod =
            tempDocsThisPeriod > 5 ? 5 : tempDocsThisPeriod;
          obj["docsThisPeriod"] = docsThisPeriod;
        } else if (
          userData.subscriptionPlan[0].docsAllowedPerMonth === 1 &&
          tempCarryOverDocs > 0
        ) {
          actualCarryOverDocs = 1;
          obj["actualCarryOverDocs"] = actualCarryOverDocs;
          let tempDocsThisPeriod =
            userData.subscriptionPlan[0].docsAllowedPerMonth +
            actualCarryOverDocs;
          const docsThisPeriod =
            tempDocsThisPeriod >= 2 ? 2 : tempDocsThisPeriod;
          obj["docsThisPeriod"] = docsThisPeriod;
        }

        idArray.push(obj);
      }
    });
    console.log("idArray", idArray);
    idArray.forEach((obj) => {
      // update db to add docsThisPeriod prop/value
    });
  });
  return;
}

getUsers();

module.exports = {
  db,
  updateDB,
};

/*
async function updateRespGenerationCount(docId) {
  await updateDoc(doc(db, "documents", docId), {
    docType: "interrogatories",
  });
}
*/
//updateRespGenerationCount("4af8c149-1bda-44a7-8c54-be0c09ed655c");

/*
var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./agentx2-firebase-adminsdk.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://agentx2.firebaseio.com",
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("restricted_access/secret_document");
*/
