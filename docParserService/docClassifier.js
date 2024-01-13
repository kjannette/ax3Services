//const fs = require("fs");
const { readFile } = require("fs/promises");

const searchRog1 = "interrogatories";
const searchRog2 = "interrogatory";

const searchProduce1 = "produce";
const searchProduce2 = "production";
const searchProduce4 = "production of documents";
const searchProduce5 = "request for production";
const searchProduce6 = "request for produc";

const searchAdmit1 = "admit";
const searchAdmit2 = "admission";
const searchAdmit3 = "admissions";

const total = {
  rogs: null,
  docProd: null,
  admit: null,
  combined: null,
};

function includesTest(str, regex) {
  return (str.match(regex) || []).length;
}

async function inspectFile(data) {
  const searchTermArr = [
    "interrogatories",
    "interrogatory",
    "produce",
    "production",
    "production of documents",
    "request to produce",
    "request for production",
    "admit",
    "admission",
    "admissions",
    "request to admit",
    "request for admissions",
  ];

  /*
  Below patterns are Michigan - specific
  const regexPattern =
    /interrogatories (#?[\sa-z0-9]{0,15}) and requests? for production+\b/g;
  const regexPattern1 =
    /interrogatories[\sa-z0-9]{0,15}and requests? for production+\b/;
  */

  const regexPattern2 =
    /interrogatories (#?[\sa-z0-9]{0,15}) and requests? for production+\b/g;

  const resultArray = [];

  if (data) {
    const temp = data.toString();
    //const containsPattern = includesTest(temp, regexPattern);
    //const containsPattern1 = includesTest(temp, regexPattern1);
    const containsPattern2 = includesTest(temp, regexPattern2);

    if (
      containsPattern2 ||
      temp
        .toLowerCase()
        .includes("interrogatories and request for production") ||
      temp
        .toLowerCase()
        .includes("interrogatories and requests for production") ||
      temp.toLowerCase().includes("interrogatories and document requests") ||
      temp.toLowerCase().includes("and requests for production of documents")
    ) {
      total.combined = "combined-numbered";
    }
  }

  let lines = await data.split("\n");
  searchTermArr.forEach((term) => {
    let obj = { searchTerm: "", count: 0 };
    obj.searchTerm = term;

    lines.forEach(function (line) {
      if (line.toLowerCase().indexOf(term) != -1) {
        obj.count++;
      }
    });
    resultArray.push(obj);
  });

  if (total.combined === "combined-numbered") {
    return total;
  } else {
    return resultArray;
  }
}

const iterateFilePaths = async (paths) => {
  const result = await Promise.all(
    paths.map(async (path) => {
      fileData = await readFile(path, "utf8");
      resultArrOrObj = await inspectFile(fileData);
      return resultArrOrObj;
    })
  );
  return result;
};

async function classifyDoc(sortedPaths) {
  const master = [
    { searchTerm: "interrogatories", count: 0 },
    { searchTerm: "interrogatory", count: 0 },
    { searchTerm: "produce", count: 0 },
    { searchTerm: "production", count: 0 },
    { searchTerm: "production of documents", count: 0 },
    { searchTerm: "request to produce", count: 0 },
    { searchTerm: "request for production", count: 0 },
    { searchTerm: "admit", count: 0 },
    { searchTerm: "admission", count: 0 },
    { searchTerm: "admissions", count: 0 },
    { searchTerm: "interrogatories and request for production", count: 0 },
    { searchTerm: "interrogatories and requests for production", count: 0 },
    { searchTerm: "interrogatories and requests for production", count: 0 },
  ];

  const result = {
    rogs: null,
    docProd: null,
    admit: null,
  };

  const termOccuranceCount = await iterateFilePaths(sortedPaths);

  const foundObj = termOccuranceCount.find(
    (item) => item.combined === "combined-numbered"
  );

  if (foundObj) {
    //pass
  }

  let interrogatories = 0;
  let interrogatory = 0;
  let produce = 0;
  let production = 0;
  let admit = 0;
  let admission = 0;
  let admissions = 0;
  let rogAndProd = 0;
  let rogAndProd2 = 0;
  let rogAndProd3 = 0;
  let rogAndProd4 = 0;

  if (!foundObj) {
    termOccuranceCount.forEach((array) => {
      array.forEach((obj) => {
        if (obj.searchTerm === "interrogatories") {
          interrogatories = interrogatories + obj.count;
        } else if (obj.searchTerm === "interrogatory") {
          interrogatory = interrogatory + obj.count;
        } else if (obj.searchTerm === "produce") {
          produce = produce + obj.count;
        } else if (obj.searchTerm === "production") {
          production = production + obj.count;
        } else if (obj.searchTerm === "production of documents") {
          production = production + obj.count;
        } else if (obj.searchTerm === "request to produce") {
          production = production + obj.count;
        } else if (obj.searchTerm === "request for production") {
          production = production + obj.count;
        } else if (obj.searchTerm === "admit") {
          admit = admit + obj.count;
        } else if (obj.searchTerm === "admission") {
          admission = admission + obj.count;
        } else if (obj.searchTerm === "admissions") {
          admissions = admissions + obj.count;
        } else if (obj.searchTerm === "request to admit") {
          admissions = admissions + obj.count;
        } else if (obj.searchTerm === "request for admissions") {
          admissions = admissions + obj.count;
        }
      });
    });
  }

  result.rogs = interrogatories + interrogatory;
  result.docProd = produce + production;
  result.admit = admit + admission + admissions;
  result.combined = false;

  if (foundObj) {
    return foundObj;
  } else {
    return result;
  }
}

module.exports = {
  classifyDoc,
};
