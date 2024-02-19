const fs = require("fs");
const docClassifer = require("./docClassifier.js");
//const checkService = require("../checkService/checkService.js");
const modelController = require("../agent/ModelController.js");
const { updateDB } = require("../firebase/firebase.js");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

async function readDir(direcPath, folder, countObject) {
  try {
    let fileNames = fs.readdirSync(direcPath);
    const dirArray = fileNames.map((name) => {
      return direcPath + name;
    });
    const sorted = dirArray.sort();
    const docType = await docClassifer.classifyDoc(sorted, folder);
    let parseOneCount = 0;
    methodSelector(docType, sorted, folder, parseOneCount);
  } catch (err) {
    console.log("read error", err);
  }
}

async function methodSelector(docType, filePaths, folder, parseOneCount) {
  console.log(docType, filePaths, folder, parseOneCount);
  let searchStr;
  let determinedDocType;
  console.log(
    ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>docType in method  selector",
    docType
  );
  if (docType.combined === "combined-numbered") {
    determinedDocType = "combined-numbered";
    const isRequests = true;
    modelController.createArrayOfQuestions(
      folder,
      determinedDocType,
      isRequests
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
    fileData = fs.readFileSync(filePath, "utf8");
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
  console.log(
    "------------------------------------------------------------------------ parseProdCount",
    parseProdCount
  );
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
    makeDir(folder, determinedDocType);
    let requestArray = [];
    let requestObject = {};
    requestObject["type"] = determinedDocType;
    requestObject["requests"] = rogs;
    requestArray.push(requestObject);
    saveParsedRogs(requestArray, folder, determinedDocType);
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
        return `${char}${temp3}`;
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
      modelController.createArrayOfQuestions(
        folder,
        determinedDocType,
        isRequests
      );
    }
  } else {
    const determinedDocType = "admissions"; //determinedDocType var value is lost by here not sure why but this hack should fix
    makeDir(folder, determinedDocType);
    let requestArray = [];
    let requestObject = {};
    requestObject["type"] = determinedDocType;
    requestObject["requests"] = rogs;
    requestArray.push(requestObject);
    parseTextFiles2SaveCount = 0;
    parseAdmitCount = 0;
    saveParsedRogs(requestArray, folder, determinedDocType);
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
  console.log(
    "++++++++++++++++++++++++++++++++++++++++++++++++++parseRogs fired"
  );
  let searchStr;
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
  console.log(
    "----------------------------------------------------------------------------->rogs.length",
    rogs.length
  );
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
    requestObject["type"] = determinedDocType;
    requestObject["requests"] = rogs;
    requestArray.push(requestObject);
    makeDir(folder, determinedDocType);
    saveParsedRogs(requestArray, folder, determinedDocType);
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
    dir = `../Documents/Requests/Parsedrogs/${folder}/`;
  } else if (determinedDocType === "production") {
    dir = `../Documents/Requests/Parsedprod/${folder}/`;
  } else if (determinedDocType === "admissions") {
    dir = `../Documents/Requests/Parsedadmit/${folder}`;
  } else if (determinedDocType === "combined-numbered") {
    dir = `../Documents/Requests/Parsedcombined/${folder}`;
  } else {
    dir = `../Documents/Requests/Fallback/${folder}`;
  }
  console.log(
    ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>dir in docParser makeDir",
    dir
  );
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
  const fdirup = path.resolve(process.cwd() + "/../Documents/Requests");
  const fdir = path.resolve(
    process.cwd() + "/../Documents/Requests/Parsedcombined"
  );
  const data2 = JSON.stringify(rogs);
  if (determinedDocType === "interrogatories") {
    dir = `${fdirup}/Parsedrogs/${folder}`;
  } else if (determinedDocType === "production") {
    dir = `${fdirup}/Parsedprod/${folder}`;
  } else if (determinedDocType === "admissions") {
    dir = `${fdirup}/Parsedadmit/${folder}`;
  }
  console.log(
    "full path in saveParsedRogs:",
    `${dir}/${folder}-jbk-parsedRequests.json`
  );
  try {
    if (folder) {
      updateDB(folder, determinedDocType);
    }
    fs.writeFile(
      `${dir}/${folder}-jbk-parsedRequests.json`,
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

module.exports = {
  readDir,
};
