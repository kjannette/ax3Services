const fs = require("fs");
const path = require("path");
const { updateDB } = require("../firebase/firebase.js");
const OpenAI = require("openai");
const {
  iteratePathsReturnString,
  makeDir,
  saveCompletions,
  selectRequestPath,
  selectResponsePath,
} = require("./utilities.js");
const {
  createArrayFromSingleDocPrompt,
  createResponseFromOneQuestionPrompt,
} = require("./promptTemplates.js");
const { OPENAI_API_KEY } = require("./secrets_1.js");
const { v4: uuidv4 } = require("uuid");
const dJSON = require("dirty-json");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

class ModelController {
  async readFileSelectMethod(docId, reqType) {
    let filePath;
    let temp;

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
    return temp;
  }

  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS ANSWERS FROM ARRAY OF REQUESTS
   *
   */

  async arrayGenAnswers(docId, reqType, isRequests) {
    console.log(
      "_____________________________________________________________ fired arrayGenAnswers"
    );
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
    const fileData = fs.readFileSync(filePath, "utf8");
    const requests = JSON.parse(fileData);
    const arrayOne = JSON.parse(requests[0].requests[0]);
    const arrayTwo = JSON.parse(requests[0].requests[1]);

    return;
    let completions;

    /*

    this probably needs to go, because combined-numbered are being parsed to json always now
    
    if (reqType == "combined-numbered") {
      completions = await this.startOne(requests, reqType, isRequests);
    } else {
      completions = await this.start(requests, reqType, isRequests);
    }
    */

    completions = await this.start(requests, reqType, isRequests);
    let masterArray = [];
    const completionsArray = [];
    const completionsObject = { type: `response to ${reqType}` };
    const finalArray = completions[0];

    let temp;
    finalArray?.forEach((comp) => {
      let obj = {};
      const responseId = uuidv4();
      obj["responseId"] = responseId;
      obj["text"] = comp;
      completionsArray.push(obj);
    });

    completionsObject["responses"] = completionsArray;
    masterArray.push(completionsObject);

    makeDir(docId, reqType, isRequests);

    temp = docId;
    temp = masterArray;
    console.log("temp in arrayGenAnswers", temp);
    saveCompletions(temp, docId, reqType, isRequests);
    return temp;
  }

  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS ANSWERS FROM TEXT BLOB
   *
   */

  async combinedGenAnswers(docId, reqType, isRequests) {
    console.log(
      "_____________________________________________________________ fired combinedGenAnswers"
    );
    const masterArray = [];
    let dirPath;

    if (reqType === "combined-numbered") {
      dirPath = `../Documents/Textfiles/${docId}/`;
    } else {
      //
    }
    let fileNames = fs.readdirSync(dirPath);
    const dirArray = fileNames.map((name) => {
      return dirPath + name;
    });

    const requestString = iteratePathsReturnString(dirArray);
    const completions = await this.startOne(requestString, reqType, isRequests); //START
    const completionsObject = { type: `response to combined-requests` };
    completionsObject["responses"] = completions;
    masterArray.push(completionsObject);

    makeDir(docId, reqType);

    temp = docId;
    temp = masterArray;

    saveCompletions(temp, docId, reqType, isRequests);
    return temp;
  }

  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS REQUESTS FROM STRING BLOB
   *
   */

  async createArrayOfQuestions(docId, reqType) {
    const masterArray = [];
    const isRequests = true;

    const dirPath = `../Documents/Textfiles/${docId}/`;
    let fileNames = fs.readdirSync(dirPath);
    const dirArray = fileNames.map((name) => {
      return dirPath + name;
    });

    let requestStr;
    let completes;
    let newArray = [];

    if (dirArray.length > 10) {
      const splitAt = Math.floor(dirArray.length / 2);
      const temp1 = dirArray.slice(0, splitAt);
      const temp2 = dirArray.slice(splitAt, dirArray.length);
      newArray.push(temp1);
      newArray.push(temp2);
      completes = await Promise.all(
        newArray.map(async (arr) => {
          console.log(
            "-----------------------------------------------------------------"
          );
          console.log("arr", arr);
          console.log(
            "-----------------------------------------------------------------"
          );
          requestStr = await iteratePathsReturnString(arr);
          const comp = await this.startOne(requestStr, reqType, isRequests);
          return comp;
        })
      );
    } else {
      requestStr = await iteratePathsReturnString(dirArray);
      completes = await this.startOne(requestStr, reqType, isRequests);
    }

    console.log("completes", completes);
    const flatReq = completes.flat();
    const completionsObject = { type: "combined-numbered" };
    completionsObject["requests"] = flatReq;

    makeDir(docId, reqType, isRequests);
    masterArray.push(completionsObject);

    let temp = docId;
    temp = masterArray;

    saveCompletions(temp, docId, reqType, isRequests);
    updateDB(docId, reqType);
    return temp;
  }

  /*
   *  LLM PROMPT CYCLE
   *  CREATE RESPONSES FROM ARRAY OF REQUEST Qs
   *
   */

  async start(requests, reqType) {
    const answersResponses = await Promise.all(
      requests.map(async (request) => {
        const prompt = createResponseFromOneQuestionPrompt(request.text);
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: prompt,
        });
        console.log(
          "completion.choices[0].message.content;",
          completion.choices[0].message.content
        );
        return completion.choices[0].message.content;
      })
    );
    const fooBar = [];
    fooBar.push(answersResponses);
    fooBar.push(reqType);
    return fooBar;
  }

  /*
   *  LLM PROMPT CYCLE
   *  CREATE ARRAY OF Qs FROM STRING BLOB
   *
   */

  async startOne(request, reqType) {
    const prompt = createArrayFromSingleDocPrompt(request);
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: prompt,
    });
    console.log(
      "________________________________________________________________________________"
    );
    console.log(
      "completion.choices[0].message.content",
      completion.choices[0].message.content
    );
    console.log(
      "________________________________________________________________________________"
    );
    return completion.choices[0].message.content;
  }
}

module.exports = new ModelController();
