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

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

class ModelController {
  async readFileSelectMethod(docId, reqType) {
    let filePath;
    let temp;

    /* This can probably be deprecated because docParser calls  createArrayOfQuestions directory
    if (reqType === "combined-numbered" && isRequests == true) {
      dumped = this.createArrayOfQuestions(docId, reqType, isRequests);
      return dumped;
    }
    */

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
    let filePath;
    const basePath = process.cwd();
    if (reqType == "combined-numbered") {
      filePath = `${basePath}/Documents/Requests/Parsedcombined/${docId}/${docId}-jbk-parsedRequests.json`;
      //temp = this.arrayGenAnswers(filePath, docId, reqType, isRequests);
    } else if (reqType == "interrogatories") {
      filePath = `${basePath}/Documents/Requests/Parsedrogs/${docId}/${docId}-jbk-parsedRequests.json`;
      //temp = this.arrayGenAnswers(filePath, docId, reqType, isRequests);
    } else if (reqType == "admissions") {
      filePath = `${basePath}/Documents/Requests/Parsedadmit/${docId}/${docId}-jbk-parsedRequests.json`;
      //temp = this.arrayGenAnswers(filePath, docId, reqType, isRequests);
    } else if (reqType == "production") {
      filePath = `${basePath}/Documents/Requests/Parsedprod/${docId}/${docId}-jbk-parsedRequests.json`;
      //temp = this.arrayGenAnswers(filePath, docId, reqType, isRequests);
    }
    const fileData = fs.readFileSync(filePath, "utf8");
    const rogs = await JSON.parse(fileData);
    const requests = rogs[0].requests;
    let completions;
    if (reqType == "combined-numbered") {
      completions = await this.startOne(requests, reqType, isRequests);
    } else {
      completions = await this.start(requests, reqType, isRequests);
    }

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

    const requestString = await iteratePathsReturnString(dirArray);
    const completions = await this.startOne(requestString, reqType, isRequests);

    const completionsObject = { type: "combined-numbered" };
    //const tempComp = JSON.parse(completions);
    completionsObject["requests"] = completions;

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
    console.log("prompt in startOne", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: prompt,
    });

    return completion.choices[0].message.content;
  }
}

module.exports = new ModelController();
