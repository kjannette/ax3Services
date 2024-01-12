const fs = require("fs");
const docParser = require("../docParserService/docParser.js");

async function checkFile(
  docType,
  filePaths,
  folder,
  searchStr,
  determinedDocType
) {
  let path;
  //console.log("determinedDocType in checkFile:", determinedDocType);
  if (determinedDocType === "interrogatories") {
    path = `../Documents/Requests/Parsedrogs/${folder}/${folder}-jbk-parsedArr.json`;
  } else if (determinedDocType === "production") {
    path = `../Documents/Requests/Parsedprod/${folder}/${folder}-jbk-parsedArr.json.json`;
  } else if (determinedDocType === "admissions") {
    path = `../Documents/Requests/Parsedadmit/${folder}/${folder}-jbk-parsedArr.json.json`;
  } else if (determinedDocType === "combined-numbered") {
    // For now assume its rogs if no other match
    path = `../Documents/Requests/Parsedcombined/${folder}/${folder}-jbk-parsedArr.json.json`;
  }

  async function fileExists(path) {
    try {
      const result = await fs.promises.stat(path, (err, stats) => {
        const reRun = err?.code
          ? err?.code === "ENOENT"
            ? true
            : false
          : false;
        return reRun;
      });
      return result.json();
    } catch (err) {
      console.log(err);
    }
  }

  //const parseError = fileExists(path);
  //console.log("parseError in checkFIle:", parseError);

  async function reRun() {
    const runAgain = await fileExists(path);
    if (runAgain) {
      const now = new Date(8.64e15).toString();
    }
  }

  fs.stat(path, function (err, stats) {
    const reRun = err?.code ? (err?.code === "ENOENT" ? true : false) : false;
  });
}

module.exports = {
  checkFile,
};

/*

  if (determinedDocType === "interrogatories") {
    path = `../Documents/Responses/Parsedrogs/${folder}/${folder}-jbk-parsedArr.json`;
  } else if (determinedDocType === "production") {
    path = `../Documents/Responses/Parsedprod/${folder}/${folder}-jbk-parsedArr.json.json`;
  } else if (determinedDocType === "admissions") {
    path = `../Documents/Responses/Parsedadmit/${folder}/${folder}-jbk-parsedArr.json.json`;
  } else if (determinedDocType === "combined-numbered") {
    // For now assume its rogs if no other match
    path = `../Documents/Fallback/${folder}/${folder}-jbk-parsedArr.json.json`;
  }


*/
