const fs = require("fs");

function selectRequestFilePath(docId, reqType) {
  let filePath;
  const basePath = process.cwd();
  if (reqType == "combined-numbered") {
    filePath = `${basePath}/Documents/Requests/Parsedcombined/${docId}/${docId}-jbk-parsedRequests.json`;
  } else if (reqType == "interrogatories") {
    filePath = `${basePath}/Documents/Requests/Parsedrogs/${docId}/${docId}-jbk-parsedRequests.json`;
  } else if (reqType == "admissions") {
    filePath = `${basePath}/Documents/Requests/Parsedadmit/${docId}/${docId}-jbk-parsedRequests.json`;
  } else if (reqType == "production") {
    filePath = `${basePath}/Documents/Requests/Parsedprod/${docId}/${docId}-jbk-parsedRequests.json`;
  }
  return filePath;
}

function selectRequestFolderPath(docId, reqType) {
  let folderPath;
  const basePath = process.cwd();
  if (reqType == "combined-numbered") {
    folderPath = `${basePath}/Documents/Requests/Parsedcombined/${docId}/`;
  } else if (reqType == "interrogatories") {
    folderPath = `${basePath}/Documents/Requests/Parsedrogs/${docId}/`;
  } else if (reqType == "admissions") {
    folderPath = `${basePath}/Documents/Requests/Parsedadmit/${docId}/`;
  } else if (reqType == "production") {
    folderPath = `${basePath}/Documents/Requests/Parsedprod/${docId}/`;
  }
  return folderPath;
}
// need to check
function selectResponseFilePath(docId, reqType) {
  let filePath;
  const basePath = process.cwd();
  if (reqType == "combined-numbered") {
    filePath = `${basePath}/Documents/Responses/Combinedresp/${docId}/${docId}-jbk-parsedRequests.json`;
  } else if (reqType == "interrogatories") {
    filePath = `${basePath}/Documents/Requests/Parsedrogs/${docId}/${docId}-jbk-parsedRequests.json`;
  } else if (reqType == "admissions") {
    filePath = `${basePath}/Documents/Requests/Parsedadmit/${docId}/${docId}-jbk-parsedRequests.json`;
  } else if (reqType == "production") {
    filePath = `${basePath}/Documents/Requests/Parsedprod/${docId}/${docId}-jbk-parsedRequests.json`;
  }
  return filePath;
}

function selectResponseFolderPath(docId, reqType) {
  let folderPath;
  const basePath = process.cwd();
  if (reqType == "combined-numbered") {
    folderPath = `${basePath}/Documents/Responses/Combinedresp/${docId}/`;
  } else if (reqType == "interrogatories") {
    folderPath = `${basePath}/Documents/Responses/Rogresp/${docId}/`;
  } else if (reqType == "admissions") {
    folderPath = `${basePath}/Documents/Responses/Admitresp/${docId}/`;
  } else if (reqType == "production") {
    folderPath = `${basePath}/Documents/Responses/Prodresp/${docId}/`;
  }
  return folderPath;
}

async function deleteDocument(docId, reqType, respGens) {
  const requestFilePath = selectRequestFilePath(docId, reqType);

  fs.stat(requestFilePath, function (err, stats) {
    if (err) {
      return err;
    } else {
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  });
}

async function deleteFolderAndContents(docId, reqType, respGens = 0) {
  const requestFolderPath = selectRequestFolderPath(docId, reqType);
  const gens = parseInt(respGens);

  function removeFolder() {
    const requestFolderPath = selectRequestFolderPath(docId, reqType);
    fs.rm(requestFolderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.log(err);
        return err;
      }
    });
    if (gens > 0) {
      const responseFolderPath = selectResponseFolderPath(docId, reqType);
      fs.rm(responseFolderPath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.log(err);
          return err;
        }
      });
    }
  }

  fs.access(
    requestFolderPath,
    fs.constants.R_OK | fs.constants.W_OK,
    removeFolder,
    gens
  ),
    (err) => {
      if (err) {
        console.log("Error in deleteFolderAndContents fs.access:", err);
        return err;
      } else {
        const requestFolderPath = selectRequestFolderPath(docId, reqType);
        fs.rm(requestFolderPath, { recursive: true, force: true }, (err) => {
          if (err) {
            console.log(err);
            return err;
          }
        });

        if (gens > 0) {
          const responseFolderPath = selectResponseFolderPath(docId, reqType);
          fs.rm(responseFolderPath, { recursive: true, force: true }, (err) => {
            if (err) {
              console.log(err);
              return err;
            }
          });
        }
      }
    };
}

async function cleanupGenFolderAndContents(docId, reqType) {
  const requestFolderPath = `/Users/kjannette/workspace/ax3/ax3Services/docGenService/Docxinfo/${docId}.json`;
  fs.rm(requestFolderPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.log(err);
      return err;
    }
  });
}

module.exports = {
  deleteDocument,
  deleteFolderAndContents,
  cleanupGenFolderAndContents,
};
