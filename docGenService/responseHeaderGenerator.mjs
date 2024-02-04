import * as fs from "fs";
import { newYorkCaptionTemplate } from "./documentTemplates/captionTemplates.mjs";
//import { newYorkStyleTemplate } from "./documentTemplates/styleTemplates.mjs";

function selectRequestPath(reqType, isRequests, folder) {
  let dir;
  if (reqType == "interrogatories") {
    dir = `../Documents/Requests/Parsedrogs/${folder}/`;
  } else if (reqType == "admissions") {
    dir = `../Documents/Requests/Parsedadmit/${folder}/`;
  } else if (reqType == "production") {
    dir = `../Documents/Requests/Parsedprod/${folder}`;
  } else if (reqType == "combined-numbered") {
    dir = `../Documents/Requests/Parsedcombined/${folder}/`;
  }
  return dir;
}

function selectResponsePath(reqType, isRequests, folder) {
  let dir;
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

async function makeDir(docId, dest) {
  const dir = `/Users/kjannette/workspace/ax3/ax3Services/docGenService/${dest}/${docId}`;

  fs.mkdir(dir, function (err) {
    if (err) {
      console.log("createDoc makeDir. Error creating directory: " + err);
    }
  });
}

/* ******************************* generateDoc *******************************  */
const responseHeaderGenerator = (docId, reqType, data) => {
  const documentType = reqType.toUpperCase();
  const jurisdiction = data?.jurisdiction.toUpperCase();

  console.log("---------------------------------->data", data);
  //const responndantPosition =
  // /  data?.clientPosition === "Plaintiff" ? "Plaintiff" : "Defendant";
  //const { defendant, plaintiff, caseNumber, judge } = data;
  //const venue = data.venue.toUpperCase();
  //const comesNow = responndantPosition === "Plaintiff" ? plaintiff : defendant;
  //let doc;
  //const dest = "Docxstaging";
  //const dest2 = "Docxinfo";
  //makeDir(docId, dest);
  //makeDir(docId, dest2);
  /*
  const templateNY = newYorkCaptionTemplate(
    jurisdiction,
    venue,
    plaintiff,
    defendant,
    caseNumber,
    judge,
    documentType,
    comesNow
  );
*/
  //doc = new Document(newYorkStyleTemplate);
  //const temp1 = JSON.parse(responseFileData);
  //const responseArray = temp1[0].responses;
  // /const temp2 = JSON.parse(requestFileData);
  //const requestArray = temp2[0].requests;
  //const allChildren = [];
  /*
  doc.addSection({
    properties: {
      type: SectionType.CONTINUOUS,
    },
    children: templateNY,
  });
  */

  /*
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(
      `/Users/kjannette/workspace/ax3/ax3Services/docGenService/Docxstaging/${docId}.docx`,
      buffer
    );
  });
*/
  data["currentRequestType"] = reqType;
  const saveData = JSON.stringify(data);
  fs.writeFile(
    `/Users/kjannette/workspace/ax3/ax3Services/docGenService/Docxinfo/${docId}.json`,
    saveData,
    function (err) {
      if (err) {
        return console.log("Error writing in responseHeaderGenerator", err);
      }
    }
  );
};

export default responseHeaderGenerator;

/*
import {
  AlignmentType,
  Document,
  convertInchesToTwip,
  Packer,
  Paragraph,
  Styles,
  Style,
  SectionType,
  TextRun,
  UnderlineType,
  Underline,
} from "docx";
*/
