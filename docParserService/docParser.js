const fs = require("fs");
const docClassifer = require("./docClassifier.js");
//const checkService = require("../checkService/checkService.js");
const modelController = require("../agent/ModelController.js");
const { updateDB } = require("../firebase/firebase.js");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { count } = require("firebase/firestore");

async function readDir(direcPath, folder, countObject) {
  const fdirup = path.join(
    __dirname,
    "..",
    "Documents",
    "Textfiles",
    `${folder}`
  );

  try {
    const dirArray = countObject.files.map((file) => {
      return `${fdirup}/${file.split(".")[0]}.txt`;
    });

    const sortedFilePaths = dirArray.sort();
    const docType = await docClassifer.classifyDoc(sortedFilePaths, folder);
    console.log("====================================== docParser readDir");
    let parseOneCount = 0;
    methodSelector(
      docType,
      sortedFilePaths,
      folder,
      parseOneCount,
      countObject
    );
  } catch (err) {
    console.log("read error", err);
  }
}

async function methodSelector(
  docType,
  filePaths,
  folder,
  parseOneCount,
  countObject
) {
  let searchStr;
  let determinedDocType;

  if (docType.combined === "combined-numbered") {
    determinedDocType = "combined-numbered";
    const isRequests = true;
    console.log(
      "=========================================determinedDocType in docParser methodSelecotr",
      determinedDocType
    );
    updateDB(docId, determinedDocType);
    modelController.createArrayOfQuestions(
      folder,
      determinedDocType,
      isRequests,
      countObject
    );
    return;
  } else if (docType.rogs > docType.docProd && docType.rogs > docType.admit) {
    determinedDocType = "interrogatories";
    let parseRogsCount = 0;
    parseRogs(docType, filePaths, folder, determinedDocType, parseRogsCount);
  } else if (
    docType.docProd > docType.rogs &&
    docType.docProd > docType.admit
  ) {
    determinedDocType = "production";
    parseProdCount = 0;
    parseProduction(
      docType,
      filePaths,
      folder,
      parseOneCount,
      determinedDocType,
      parseProdCount
    );
    return;
  } else if (docType.admit > docType.rogs && docType.admit > docType.docProd) {
    determinedDocType = "admissions";
    let parseAdmitCount = 0;
    parseAdmissions(
      docType,
      filePaths,
      folder,
      parseOneCount,
      determinedDocType,
      parseAdmitCount
    );
    return;
  } else if (
    docType.combined > docType.rogs &&
    docType.combined > docType.docProd &&
    docType.combined > docType.admit
  ) {
    // maybe deprecate
    determinedDocType = "combined";
    parseCombined(docType, filePaths, folder, parseOneCount, determinedDocType);
  } else {
    //  To avoid undefined errors in later checks (for now)
    searchStr = "N~U**LL";
  }
  return determinedDocType;
}

/*******************************************************************************
 *
 *  Combined (Interrogatories and Requests for Production) Request parser
 *
 *******************************************************************************/

async function parseCombined(
  docType,
  filePaths,
  folder,
  parseOneCount,
  determinedDocType,
  parseCombinedCount
) {
  const processArray = [];
  const rogs = [];

  filePaths.forEach((filePath) => {
    fileData = fs.readFileSync(filePath, "utf8", function (err) {
      console.log("error in readFile", err);
    });
    const arr = [];
    searchStr = 1;

    const stringChunk = fileData.toString().toLowerCase();

    const string = fileData.toString().toLowerCase();
    for (
      let pos = stringChunk.lastIndexOf(`${searchStr.toString()}.`);
      pos > -1;
      pos = stringChunk.indexOf(`${searchStr.toString()}.`, pos + 1)
    ) {
      arr.push(pos);
      searchStr++;
      console.log("arr, pos", arr, pos);
    }

    const questionsArray = arr.map((item, i) => {
      return string.slice(arr[i], arr[i + 1]);
    });
    const clean = questionsArray.map((item) => {
      return item.replace(/\r?\n|\r/g, "");
    });

    processArray.push(...clean);

    const unique = processArray.filter(function (item, pos) {
      return processArray.indexOf(item) == pos;
    });

    unique.forEach((item) => {
      let obj = {};
      const requestId = uuidv4();
      obj["requestId"] = requestId;
      obj["text"] = item;
      rogs.push(obj);
    });

    if (rogs.length < 3) {
    } else {
      makeDir(folder, determinedDocType);
      let requestArray = [];
      let requestObject = {};
      requestObject["type"] = determinedDocType;
      requestObject["requests"] = rogs;
      requestArray.push(requestObject);
      saveParsedRogs(requestArray, folder, determinedDocType);
    }
  });
  return;
}

/*******************************************************************************
 *
 *  Request for production of documents parser
 *
 *******************************************************************************/

async function parseProduction(
  docType,
  filePaths,
  folder,
  parseOneCount,
  determinedDocType,
  parseProdCount
) {
  const initialHeaderString = "requests for production"; // /^request* for admission*$/;

  const processArray = [];
  const rogs = [];
  let searchStr;
  if (parseProdCount < 1) {
    searchStr = "REQUEST FOR PRODUCTION";
  } else if (parseProdCount === 1) {
    searchStr = "REQUEST NO";
  } else if (parseProdCount === 2) {
    searchStr = "REQUEST NUM";
  }

  filePaths.forEach((filePath, mainIndex) => {
    let fileData;
    fileData = fs.readFileSync(filePath, "utf8");
    const arr = [];

    const stringChunk = fileData.toString().toLowerCase();
    const string = fileData.toString().toLowerCase();

    for (
      let pos = stringChunk.indexOf(searchStr.toLowerCase());
      pos > -1;
      pos = stringChunk.indexOf(searchStr.toLowerCase(), pos + 1)
    ) {
      arr.push(pos);
    }

    const questionsArray = arr.map((item, i) => {
      return string.slice(arr[i], arr[i + 1]);
    });
    const clean = questionsArray.map((item) => {
      return item.replace(/\r?\n|\r/g, "");
    });
    processArray.push(...clean);
  });

  const unique = processArray.filter(function (item, pos) {
    return processArray.indexOf(item) == pos;
  });

  unique.forEach((item) => {
    let obj = {};
    const requestId = uuidv4();
    obj["requestId"] = requestId;
    obj["text"] = item;
    rogs.push(obj);
  });

  if (rogs.length < 2) {
    if (parseProdCount < 2) {
      parseProdCount++;
      parseProduction(
        docType,
        filePaths,
        folder,
        parseOneCount,
        determinedDocType,
        parseProdCount
      );
    } else {
      determinedDocType = "combined-numbered";
      const isRequests = true;
      modelController.createArrayOfQuestions(
        folder,
        determinedDocType,
        isRequests
      );
      return;
    }
  } else {
    const docId = folder;
    const reqType = "production"; //determinedDocType var value is lost by here not sure why but this hack should fix
    const directionVar = "Requests";
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      `${directionVar}`,
      `${reqType}`,
      `${docId}`
    );
    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });
    let requestArray = [];
    let requestObject = {};
    requestObject["type"] = determinedDocType;
    requestObject["requests"] = rogs;
    requestArray.push(requestObject);
    const fileSuffix = "-jbk-parsedRequests.json";
    const data = JSON.stringify(requestArray);
    fs.writeFile(
      `${saveDirectory}/${docId}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log("Error in parseProd writeFile:", err);
        }
      }
    );
  }
}

/*******************************************************************************
 *
 *  Requests for Admissions parser
 *
 *******************************************************************************/

async function parseAdmissions(
  docType,
  filePaths,
  folder,
  parseOneCount,
  determinedDocType,
  parseAdmitCount
) {
  const initialHeaderString = "requests for admissions"; //^request* for admission*$/;
  console.log(
    "parseAdmissions called-------------------------------------------"
  );
  const processArray = [];
  const rogs = [];
  let searchStr;
  if (parseAdmitCount < 1) {
    searchStr = "REQUEST NO";
  } else if (parseAdmitCount === 1) {
    searchStr = "ADMIT THAT";
  } else if (parseAdmitCount === 2) {
    searchStr = "ADMIT";
  } else if (parseAdmitCount === 3) {
    regex = /^[1-9]?$/;
    searchStr = `Request No. ${reggex}`;
  } else if (parseAdmitCount === 4) {
    regex = /^[1-9][0-9]?$/;
    searchStr = `Request No. ${reggex}`;
  } else if (parseAdmitCount === 5) {
    regex = /^[1-9]?$/;
    searchStr = `Request ${reggex}.`;
  } else {
    regex = /^[1-9][0-9]?$/;
    searchStr = `Request ${reggex}.`;
  }

  filePaths.forEach((filePath, mainIndex) => {
    let fileData;
    fileData = fs.readFileSync(filePath, "utf8");
    const arr = [];

    const stringChunk = fileData.toString().toLowerCase();
    //const string = fileData.toString().toLowerCase();  this might solve lowercase problem
    const string = fileData.toString();
    for (
      let pos = stringChunk.indexOf(searchStr.toLowerCase());
      pos > -1;
      pos = stringChunk.indexOf(searchStr.toLowerCase(), pos + 1)
    ) {
      arr.push(pos);
    }

    const questionsArray = arr.map((item, i) => {
      return string.slice(arr[i], arr[i + 1]);
    });
    const clean = questionsArray.map((item) => {
      let temp4;
      const temp = item.replace(/\r?\n|\r/g, "");
      const temp2 = temp.replace("request no.", "").trim();
      const temp3 = temp2.replace("REQUEST NO.", "").trim();
      const firstChar = Number(temp3[0]);
      if (Number.isInteger(firstChar)) {
        temp4 = temp3.substring(3);
        char = temp3[2].toUpperCase();
        return `${char}${temp4}`;
      } else {
        return temp2;
      }
    });
    processArray.push(...clean);
  });

  const unique = processArray.filter(function (item, pos) {
    return processArray.indexOf(item) == pos;
  });

  unique.forEach((item) => {
    let obj = {};
    const requestId = uuidv4();
    obj["requestId"] = requestId;
    obj["text"] = item;
    rogs.push(obj);
  });

  if (rogs.length < 2) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>rogs.length < 2 fired");
    if (parseAdmitCount < 6) {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>parseAdmitCount < 6 fired");
      let determinedDocType = "admissions";
      parseAdmitCount++;
      parseAdmissions(
        docType,
        filePaths,
        folder,
        parseOneCount,
        determinedDocType,
        parseAdmitCount
      );
    } else {
      console.log(
        "--------------------> Parsed admissions switching to LLM calling createArrayOfQuestions"
      );
      const isRequests = true;
      determinedDocType = "combined-numbered";
      updateDB(docId, determinedDocType);
      modelController.createArrayOfQuestions(
        folder,
        determinedDocType,
        isRequests
      );
    }
  } else {
    const reqType = "admissions"; //determinedDocType var value is lost by here not sure why but this hack should fix
    const directionVar = "Requests";
    const docId = folder;
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      "admissions",
      `${docId}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });
    let requestArray = [];
    let requestObject = {};
    requestObject["type"] = determinedDocType;
    requestObject["requests"] = rogs;
    requestArray.push(requestObject);
    parseTextFiles2SaveCount = 0;
    parseAdmitCount = 0;
    const data = JSON.stringify(requestArray);
    const fileSuffix = "-jbk-parsedRequests.json";

    fs.writeFile(
      `${saveDirectory}/${docId}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log("Error in parse admit writeFile:", err);
        }
      }
    );
    const reqstType = "admissions";
    const isRequests = true;
    modelController.arrayGenAnswers(docId, reqstType, isRequests);
  }
}

/*******************************************************************************
 *
 *  Interrogatory Parser
 *
 *******************************************************************************/

async function parseRogs(
  docType,
  filePaths,
  folder,
  determinedDocType,
  parseRogsCount
) {
  let searchStr;
  console.log(
    "***************************************************************************** PARSE ROGS FIRED"
  );
  if (parseRogsCount < 1) {
    searchStr = "INTERROGATORY NO";
  } else {
    searchStr = "INTERROGATORY NUM";
  }
  const processArray = [];
  const rogs = [];
  filePaths.forEach((filePath) => {
    let fileData = fs.readFileSync(filePath, "utf8");
    const arr = [];

    if (fileData) {
      if (!fileData.toLowerCase().includes(searchStr.toLowerCase())) return;
    }

    const string = fileData.toString();

    for (
      let pos = fileData.toLowerCase().indexOf(searchStr.toLowerCase());
      pos > -1;
      pos = fileData.toLowerCase().indexOf(searchStr.toLowerCase(), pos + 1)
    ) {
      arr.push(pos);
    }

    const questionsArray = arr.map((item, i) => {
      return string.slice(arr[i], arr[i + 1]);
    });

    const clean = questionsArray.map((item) => {
      return item.replace(/\r?\n|\r/g, "");
    });
    processArray.push(...clean);
  });

  const unique = processArray.filter(function (item, pos) {
    return processArray.indexOf(item) == pos;
  });

  const regex = /[A-Za-z]+ [A-Za-z]+\. [A-Za-z0-9]+:/;
  const regex2 = new RegExp(/.[Pp]age\s\d{1,2}$/);
  const tempArr = unique.map((item) => {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const scrubbed = item.replace(regex, "");
    const scrubbedMore = scrubbed.replace(regex2, ".");
    const caps = capitalizeFirstLetter(scrubbedMore);
    return caps;
  });

  tempArr.forEach((item) => {
    let obj = {};
    const interrogatoryId = uuidv4();
    obj["interrogatoryId"] = interrogatoryId;
    obj["text"] = item;
    rogs.push(obj);
  });

  if (rogs.length < 2) {
    if (parseRogsCount < 2) {
      parseRogsCount++;
      parseRogs(docType, filePaths, folder, determinedDocType, parseRogsCount);
    } else {
      const isRequests = true;
      modelController.createArrayOfQuestions(
        folder,
        determinedDocType,
        isRequests
      );
      return;
    }
  } else {
    let requestArray = [];
    let requestObject = {};
    requestObject["type"] = "interrogatories";
    requestObject["requests"] = rogs;
    requestArray.push(requestObject);
    const docId = folder;
    const reqType = "interrogatories"; //determinedDocType var value is lost by here not sure why but this hack should fix
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      "interrogatories",
      `${folder}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });

    const fileSuffix = "-jbk-parsedRequests.json";
    const data = JSON.stringify(requestArray);
    console.log(
      "**************************************************************data",
      data
    );
    updateDB(docId, reqType);
    console.log(
      " `${saveDirectory}/${docId}${fileSuffix}`",
      `${saveDirectory}/${folder}${fileSuffix}`
    );
    fs.writeFileSync(
      `${saveDirectory}/${folder}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log("Error in parseRogs writeFile:", err);
        }
      }
    );
    // Send it straight to LLM
    const isRequests = false;
    modelController.arrayGenAnswers(docId, reqType, isRequests);
  }
}

/*******************************************************************************
 *
 *  Create a directory
 *
 *******************************************************************************/

async function makeDir(folder, determinedDocType) {
  let dir;
  if (determinedDocType === "interrogatories") {
    dir = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      "interrogatories",
      `${folder}`
    );
  } else if (determinedDocType === "production") {
    dir = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      "production",
      `${folder}`
    );
  } else if (determinedDocType === "admissions") {
    dir = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      "admissions",
      `${folder}`
    );
  } else if (determinedDocType === "combined-numbered") {
    dir = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      "combnined-numbered",
      `${folder}`
    );
  } else {
    dir = `../Documents/Requests/Fallback/${folder}`;
  }
  fs.mkdir(dir, function (err) {
    if (err) {
      console.log("docParser makeDir error.  Error Creating Directory: " + err);
    }
  });
}

/*******************************************************************************
 *
 *  Write result to a file
 *
 *******************************************************************************/

function saveParsedRogs(rogs, folder, determinedDocType) {
  let dir;
  const fdirup = path.join(__dirname, "..", "Documents", "Requests");

  const data2 = JSON.stringify(rogs);
  if (determinedDocType === "interrogatories") {
    dir = `${fdirup}/interrogatories/${folder}/`;
  } else if (determinedDocType === "production") {
    dir = `${fdirup}/production/${folder}/`;
  } else if (determinedDocType === "admissions") {
    dir = `${fdirup}/admissions/${folder}/`;
  } else if (determinedDocType === "combined-numbered") {
    dir = `${fdirup}/combined-numbered/${folder}/`;
  }

  try {
    if (folder) {
      updateDB(folder, determinedDocType);
    }
    fs.writeFile(
      dir + `${folder}-jbk-parsedRequests.json`,
      data2,
      function (err) {
        if (err) {
          return console.log("Error writing in saveParsedRogs", err);
        }
      }
    );
  } catch (err) {
    console.log("docParser saveParsedRogs error. Error writing file:", err);
  }
}
/*
const reqType = "admissions";
const docId = "73cf6d0d-15cd-4d12-9edc-00bfa8de8ebb";
const isRequests = true;

modelController.testSaveFunction(docId, reqType, isRequests);
*/
module.exports = {
  readDir,
  makeDir,
  saveParsedRogs,
};
