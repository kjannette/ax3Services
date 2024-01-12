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
