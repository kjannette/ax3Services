const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  storeEditedCompletion,
} = require("./storageService/storeEditedCompletion.js");
const {
  deleteDocument,
  deleteFolderAndContents,
  cleanupGenFolderAndContents,
} = require("./storageService/deleteDirOrDoc.js");
const modelController = require("./agent/ModelController.js");

const port = 4000;

const storage = multer.diskStorage({
  destination: "Documents/Uploads/",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false })); //< Add this
app.use(express.json());

const upload = multer({ storage: storage });

/*
 *  Client POST new request doc for docParser to parse into array
 *
 */

app.post("/parseNewDoc", upload.single("file"), function (req, res) {
  try {
    //check
    const file = req.file;
  } catch (err) {
    res.send().json(err);
  }
  res.end();
});

/*
 *
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
    }
  }
);

/*
 *
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
app.get("/genResponseBlob/:docId/:docType/:isRequests", async (req, res) => {
  const { docId, docType } = req.params;

  const isRequests = false;
  try {
    const data = await modelController.readFileSelectMethod(
      docId,
      docType,
      isRequests
    );
    res.send(data);
  } catch (error) {
    console.log(error);
  }
});
*/

/*
 *  POST to Generate Docx
 */

app.post("/genDocx/:docId/:reqType", async function (req, res) {
  const { docId, reqType } = req.params;
  const data = req.body;
  try {
    const defaultMjsExport = (
      await import(
        "/Users/kjannette/workspace/ax3/ax3Services/docGenService/responseHeaderGenerator.mjs"
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
    root: `/Users/kjannette/workspace/ax3/ax3Services/Docxfinal/`,
  });
});

/*
 *
 *  Cleanup docx working files (temp workaround)
 *
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
    storeEditedCompletion(data);
  } catch (err) {
    console.log("Error:", err);
  }
  res.end();
});

/*
 *
 *  Client GET previously-uploaded discovery request doc
 *  DISABLED ON FRONT END - may deprecate
 */

app.get("/Backend/Documents/Uploads/:docId/", (req, res) => {
  const { docId } = req.params;
  res.sendFile(`${docId}.pdf`, {
    root: "/Users/kjannette/workspace/agentx7/Backend/Documents/Uploads",
  });
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

  try {
    res.sendFile(`${docId}-jbk-parsedRequests.json`, {
      root: `/Users/kjannette/workspace/ax3/ax3Services/Documents/Requests/${folder}/${docId}/`,
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

app.listen(port);

/*
Workaround for import because createDocx is a module

const responseHeaderGeneratorMethod = async () => {
  const { generateDoc } = await import(
    "./docGenService/responseHeaderGenerator .mjs"
  );
  return responseHeaderGenerator;
};
/*
Workaround for import because createDocx is a module

const responseHeaderGeneratorMethod = async () => {
  const { generateDoc } = await import(
    "./docGenService/responseHeaderGenerator .mjs"
  );
  return responseHeaderGenerator;
};
*/
