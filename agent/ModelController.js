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
    console.log("completionsArray", completionsArray);
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
   *  RETURNS ANSWERS FROM ARRAY OF REQUESTS - COMBINED TYPE
   *
   */

  async arrayGenAnswersCombined(docId, reqType, isRequests) {
    let filePath;
    const basePath = process.cwd();
    if (reqType == "combined-numbered") {
      filePath =
        "/Users/kjannette/workspace/ax3/ax3Services/Documents/Requests/Parsedcombined/20886dec-3459-46b7-9c0e-80c390cf058b/20886dec-3459-46b7-9c0e-80c390cf058b-jbk-parsedRequests.json";
      //filePath = `${basePath}/Documents/Requests/Parsedcombined/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "interrogatories") {
      filePath = `${basePath}/Documents/Requests/Parsedrogs/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "admissions") {
      filePath = `${basePath}/Documents/Requests/Parsedadmit/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "production") {
      filePath = `${basePath}/Documents/Requests/Parsedprod/${docId}/${docId}-jbk-parsedRequests.json`;
    }

    const fileData = fs.readFileSync(filePath, "utf8");
    const rogs = await JSON.parse(fileData);
    const requests = rogs[0].requests;
    let completions;

    completions = await this.start(requests, reqType, isRequests);

    let masterArray = [];
    const completionsArray = [];
    const completionsObject = { type: `response to ${reqType}` };
    const finalArray = completions[0];

    finalArray?.forEach((comp) => {
      console.log("comp", comp);
      let obj = {};
      const responseId = uuidv4();
      obj["responseId"] = responseId;
      obj["text"] = comp;
      completionsArray.push(obj);
    });
    completionsObject["responses"] = completionsArray;
    masterArray.push(completionsObject);

    makeDir(docId, reqType, isRequests);
    let temp;
    temp = docId;
    temp = masterArray;

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
    let flatReq;
    let parsedRequests = [];

    if (dirArray.length > 10) {
      const splitAt = Math.floor(dirArray.length / 2);
      const temp1 = dirArray.slice(0, splitAt);
      const temp2 = dirArray.slice(splitAt, dirArray.length);
      newArray.push(temp1);
      newArray.push(temp2);
      completes = await Promise.all(
        newArray.map(async (arr) => {
          requestStr = await iteratePathsReturnString(arr);
          const comp = await this.startOne(requestStr, reqType, isRequests);
          return comp;
        })
      );
      let fooz = JSON.parse(completes[0]);
      let barz = JSON.parse(completes[1]);

      fooz.forEach((item) => {
        parsedRequests.push(item);
      });
      barz.forEach((item) => {
        parsedRequests.push(item);
      });
    } else {
      requestStr = await iteratePathsReturnString(dirArray);
      flatReq = await this.startOne(requestStr, reqType, isRequests);
      try {
        parsedRequests = JSON.parse(flatReq);
      } catch (err) {
        console.log(
          "Error parsing json in ModelController.createArrayOfQuestions: ",
          err
        );
      }
    }

    makeDir(docId, reqType, isRequests);
    const completionsObject = { type: "combined-numbered" };
    completionsObject["requests"] = parsedRequests;

    masterArray.push(completionsObject);

    let temp = docId;
    temp = masterArray;

    saveCompletions(temp, docId, reqType, isRequests);
    updateDB(docId, reqType);
    return temp;
  }

  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS REQUESTS FROM STRING BLOB
   *  FOR VERY LONG REQUEST DOCUMENTS
   * (> 50 pages?? ... guestimate; determined by timer in tesseWatcher)
   */

  async createArrayOfQuestionsLarge(docId, reqType) {
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
    let flatReq;
    let parsedRequests = [];

    const arrSize = 20;

    while (dirArray.length > 0) {
      newArray.push(dirArray.splice(0, arrSize));
    }

    completes = await Promise.all(
      newArray.map(async (arr) => {
        requestStr = await iteratePathsReturnString(arr);
        const comp = await this.startOne(requestStr, reqType, isRequests);
        return comp;
      })
    );

    const num = newArray.length - 1;
    for (let i = 0; i < num; i++) {
      try {
        let temp = dJSON.parse(completes[i]);
        temp.forEach((item) => {
          parsedRequests.push(item);
        });
      } catch (err) {
        console.log(
          `Error parsing JSON in completions for item at index no ${i}`,
          err
        );
      }
    }

    /*
    const foo = dJSON.parse(completes[0]);
    const bar = dJSON.parse(completes[1]);
    console.log("foo", foo);
    parsedRequests = completes.flat(Infinity);
    parsedRequests = foo.concat(bar);
*/
    makeDir(docId, reqType, isRequests);

    const completionsObject2 = { type: "combined-numbered" };
    completionsObject2["requests"] = parsedRequests;

    masterArray.push(completionsObject2);

    let temp2 = docId;
    temp2 = masterArray;

    saveCompletions(temp2, docId, reqType, isRequests);
    updateDB(docId, reqType);
    return temp2;
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
    return completion.choices[0].message.content;
  }
}
/*

  async callMakeDir(temp, docId, reqType, isRequests) {
    makeDir(temp, docId, reqType, isRequests);
  }
  async callSavecompletions(temp, docId, reqType, isRequests) {
    saveCompletions(temp, docId, reqType, isRequests);
  }
const docId = "20886dec-3459-46b7-9c0e-80c390cf058b";
const reqType = "combined-numbered";
const isRequests = false;
const modCon = new ModelController();
modCon.arrayGenAnswersCombined(docId, reqType, isRequests);
*/
module.exports = new ModelController();
