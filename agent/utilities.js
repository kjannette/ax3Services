const fs = require("fs");
const path = require("path");
/*
 *
 *  Strore returned completions
 */

function saveCompletions(responses, folder, reqType, isRequests) {
  const data = JSON.stringify(responses);

  if (isRequests === true) {
    dir = selectRequestPath(reqType, isRequests, folder);
  } else {
    dir = selectResponsePath(reqType, isRequests, folder);
  }

  let fileSuffix;

  if (isRequests === true) {
    fileSuffix = `-jbk-parsedRequests.json`;
  } else {
    fileSuffix = `-jbk-responses.json`;
  }

  try {
    fs.writeFile(`${dir}${folder}${fileSuffix}`, data, function (err) {
      if (err) {
        return console.log("Error in saveCompletions writeFile:", err);
      }
    });
  } catch (err) {
    console.log("Error writing file:", err);
  }
}

function selectRequestPath(reqType, isRequests, folder) {
  let dir;

  const fdirup = path.resolve(process.cwd() + "/../Documents/Requests");
  const fdir = path.resolve(
    process.cwd() + "/../Documents/Requests/Parsedcombined"
  );

  console.log(
    "->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>fdirup",
    fdirup
  );
  if (reqType == "interrogatories") {
    dir = `${fdirup}/Parsedrogs/${folder}/`;
  } else if (reqType == "admissions") {
    dir = `${fdirup}/Parsedadmit/${folder}/`;
  } else if (reqType == "production") {
    dir = `${fdirup}/Parsedprod/${folder}/`;
  } else if (reqType == "combined-numbered") {
    //`/Users/kjannette/workspace/ax3/ax3Services/Documents/Requests/Parsedcombined/${folder}`
    dir = `${fdir}/${folder}/`;
  }
  return dir;
}

function selectResponsePath(reqType, isRequests, folder) {
  let dir;
  const fdirup = path.resolve(process.cwd() + "/../Documents/Responses");
  const fdir = path.resolve(
    process.cwd() + "/../Documents/Requests/Parsedcombined"
  );

  console.log(
    "->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>fdirup",
    fdirup
  );
  if (reqType === "interrogatories") {
    dir = `${fdirup}/Rogresp/${folder}/`;
  } else if (reqType == "admissions") {
    dir = `${fdirup}/Admitresp/${folder}/`;
  } else if (reqType == "production") {
    dir = `${fdirup}/Prodresp/${folder}/`;
  } else if (reqType == "combined-numbered") {
    dir = `${fdir}/${folder}/`;
  }
  return dir;
}

const directoryPath = `/Users/kjannette/workspace/agentxa2new/Backend/Documents/Textfiles/`;

/**
 *
 * Takes path to directory returns
 * concat path + fileName
 */

async function readDir(docId, direcPath = directoryPath) {
  try {
    const fullPath = direcPath + `${docId}`;
    let fileNames = fs.readdirSync(direcPath);
    const dirArray = fileNames.map((name) => {
      return direcPath + name;
    });
    return dirArray;
  } catch (err) {
    console.log("read error", err);
  }
}

/**
 *  Create directory w/its location based on if
 *  1. request or response and
 *  2. request/response type
 */

///Users/kjannette/workspace/ax3/ax3Services/Documents/Requests/Parsedcombined
async function makeDir(folder, reqType, isRequests) {
  let dir;
  if (isRequests === true) {
    dir = selectRequestPath(reqType, isRequests, folder);
  } else {
    dir = selectResponsePath(reqType, isRequests, folder);
  }

  fs.mkdir(`${dir}`, function (err) {
    if (err) {
      console.log("makeDir utilities error creating directory: " + err);
    }
  });
}

/**
 * Takes an array of file paths, reads all files,
 * pushes string contents to an array, then
 * joins into massive string to stream to LLM
 *
 */

async function iteratePathsReturnString(paths) {
  const masterArray = [];
  for (let path of paths) {
    if (path == undefined || path == null) {
      return;
    }
    const fileData = await fs.promises.readFile(path, "utf8");
    masterArray.push(fileData);
  }
  const massiveString = masterArray.join();
  return massiveString;
}

const reqType = "combined-numbered";
isRequests = true;
folder = "461d977c-1033-45b0-85ab-66c49a227d5b";
selectRequestPath(reqType, isRequests, folder);

module.exports = {
  readDir,
  makeDir,
  iteratePathsReturnString,
  selectResponsePath,
  selectRequestPath,
  saveCompletions,
};
