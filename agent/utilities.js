const fs = require("fs");

/*
 *
 *  Strore returned completions
 *
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
    fs.writeFile(dir + `${folder}${fileSuffix}`, data, function (err) {
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
  if (reqType == "interrogatories") {
    dir = `../Documents/Requests/Parsedrogs/${folder}/`;
  } else if (reqType == "admissions") {
    dir = `../Documents/Requests/Parsedadmit/${folder}/`;
  } else if (reqType == "production") {
    dir = `../Documents/Requests/Parsedprod/${folder}/`;
  } else if (reqType == "combined-numbered") {
    dir = `../Documents/Requests/Parsedcombined/${folder}/`;
  }
  return dir;
}

function selectResponsePath(reqType, isRequests, folder) {
  let dir;
  // called from app.js ?
  if (reqType === "interrogatories") {
    dir = `./Documents/Responses/Rogresp/${folder}/`;
  } else if (reqType == "admissions") {
    dir = `./Documents/Responses/Admitresp/${folder}/`;
  } else if (reqType == "production") {
    dir = `./Documents/Responses/Prodresp/${folder}/`;
  } else if (reqType == "combined-numbered") {
    dir = `./Documents/Responses/Combinedresp/${folder}/`;
  }
  return dir;
}

const directoryPath = `/Users/kjannette/workspace/agentxa2new/Backend/Documents/Textfiles/`;

/**
 *
 * Takes path to directory returns
 * concat path + fileName
 *
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
 *
 */

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

module.exports = {
  readDir,
  makeDir,
  iteratePathsReturnString,
  selectResponsePath,
  selectRequestPath,
  saveCompletions,
};
