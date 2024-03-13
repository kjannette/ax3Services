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
  createArrayOfInterrogatoriesPlaintiffPrompt,
  createArrayOfInterrogatoriesDefendantPrompt,
  createVerboseResponseFromOneQuestionPrompt,
  parseRequestsFromStringBlobPrompt,
} = require("./promptTemplates.js");
const { OPENAI_API_KEY } = require("./secrets_1.js");
const { v4: uuidv4 } = require("uuid");
const dJSON = require("dirty-json");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

class ModelController {
  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS ANSWERS FROM ARRAY OF REQUESTS
   *
   */

  async arrayGenAnswers(docId, reqType, isRequests) {
    let filePath;
    const basePath = process.cwd();

    if (reqType == "combined-numbered") {
      filePath = `${basePath}/Documents/Requests/combined-numbered/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "interrogatories") {
      filePath = `${basePath}/Documents/Requests/interrogatories/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "admissions") {
      filePath = `${basePath}/Documents/Requests/admissions/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "production") {
      filePath = `${basePath}/Documents/Requests/production/${docId}/${docId}-jbk-parsedRequests.json`;
    }
    console.log(
      "**arrayGenAnswers ------------------------- filePath",
      filePath
    );
    const fileData = fs.readFileSync(filePath, "utf8");
    const rogs = await JSON.parse(fileData);
    const requests = rogs[0].requests;
    let completions;
    if (reqType == "combined-numbered") {
      completions = await this.startOne(requests, clientPosition);
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

    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      "Responses",
      `${reqType}`,
      `${docId}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("arrayGenAnswers error creating directory: " + err);
      }
    });

    temp = docId;
    temp = masterArray;
    const data = JSON.stringify(temp);
    const fileSuffix = "-jbk-responses.json";

    fs.writeFile(
      `${saveDirectory}/${docId}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log("arrayGenAnswers - error in fs writeFile:", err);
        }
      }
    );
    //saveCompletions(temp, docId, reqType, isRequests);
    return temp;
  }

  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS ANSWERS FROM ARRAY OF REQUESTS - COMBINED TYPE
   *
   */

  async arrayGenAnswersCombined(docId, reqType, isRequests) {
    /*
    let filePath;
    const basePath = process.cwd();
    if (reqType == "combined-numbered") {
      filePath = `${basePath}/Documents/Requests/Parsedcombined/${docId}/${docId}-jbk-parsedRequests.json`;
      //filePath = `${basePath}/Documents/Requests/Parsedcombined/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "interrogatories") {
      filePath = `${basePath}/Documents/Requests/Parsedrogs/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "admissions") {
      filePath = `${basePath}/Documents/Requests/Parsedadmit/${docId}/${docId}-jbk-parsedRequests.json`;
    } else if (reqType == "production") {
      filePath = `${basePath}/Documents/Requests/Parsedprod/${docId}/${docId}-jbk-parsedRequests.json`;
    }
    */

    const path = path.join(
      __dirname,
      "..",
      "Documents",
      "Requests",
      `${reqType}`,
      `${docId}`
    );

    const fileData = fs.readFileSync(
      `${path}/${docId}-jbk-parsedRequests.json`,
      "utf8"
    );

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
    const directionVar = isRequests ? "Requests" : "Responses";
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      `${directionVar}`,
      `${reqType}`,
      `${docId}`
    );

    const fileSuffix = isRequests
      ? "-jbk-parsedRequests.json"
      : "-jbk-responses.json";

    let temp;
    temp = docId;
    temp = masterArray;

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
    const completions = await this.startOne(
      requestString,
      reqType,
      clientPosition
    ); //START
    const completionsObject = { type: `response to combined-requests` };
    completionsObject["responses"] = completions;
    masterArray.push(completionsObject);

    const directionVar = isRequests ? "Requests" : "Responses";
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      `${directionVar}`,
      `${reqType}`,
      `${docId}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });

    temp = docId;
    temp = masterArray;
    const data = JSON.stringify(temp);
    const fileSuffix = isRequests
      ? "-jbk-parsedRequests.json"
      : "-jbk-responses.json";

    fs.writeFile(
      `${saveDirectory}/${docId}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log(
            "combinedGenAnswers - error in fs writeFile:",
            err
          );
        }
      }
    );
    return temp;
  }

  /*
   *  LLM PROMPT CONTROLLER
   *  RETURNS REQUESTS FROM STRING BLOB
   *
   */

  async createArrayOfQuestions(docId, reqType, isRequests = true, countObject) {
    const masterArray = [];

    const dirPath = path.join(
      __dirname,
      "..",
      "Documents",
      "Textfiles",
      `${docId}`
    );
    console.log(
      "createArrayOfQuestions _++___+_+_+_+_+_+_+_+_ _++___+_+_+_+_+_+_+_+_ _++___+_+_+_+_+_+_+_+_ _++___+_+_+_+_+_+_+_+_ _++___+_+_+_+_+_+_+_+_ countObject",
      countObject
    );

    const clientPosition = countObject.clientPosition;
    //const dirPath = `../Documents/Textfiles/${docId}/`;
    let fileNames = fs.readdirSync(dirPath);
    console.log("createArrayOfQuestions fileNames", fileNames);
    const dirArray = fileNames.map((name) => {
      return `${dirPath}/${name}`;
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
          const comp = await this.startOne(requestStr, reqType, clientPosition);
          return comp;
        })
      );

      let fooz = null;
      let barz = null;
      try {
        try {
          fooz = JSON.parse(completes[0]);
          if (!fooz) {
            fooz = dJSON.parse(completes[0]);
          }
        } catch (err) {
          console.log("err in first fooz try", err);
        }
      } catch (err) {
        console.log("Error in createArrayOfQuestions at 237:", err);
      }

      try {
        try {
          barz = JSON.parse(completes[1]);
          if (!barz) {
            fooz = dJSON.parse(completes[1]);
          }
        } catch (err) {
          console.log("err in first barz try", err);
        }
      } catch (err) {
        console.log("Error in createArrayOfQuestions at 250:", err);
      }

      fooz.forEach((item) => {
        parsedRequests.push(item);
      });
      barz.forEach((item) => {
        parsedRequests.push(item);
      });
    } else {
      requestStr = await iteratePathsReturnString(dirArray);
      flatReq = await this.startOne(requestStr, reqType, clientPosition);
      try {
        parsedRequests = JSON.parse(flatReq);
      } catch (err) {
        console.log(
          "Error parsing json in ModelController.createArrayOfQuestions: ",
          err
        );
      }
    }
    const directionVar = isRequests ? "Requests" : "Responses";
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      `${directionVar}`,
      `${reqType}`,
      `${docId}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });

    const completionsObject = { type: "combined-numbered" };
    completionsObject["requests"] = parsedRequests;

    masterArray.push(completionsObject);

    let temp = docId;
    temp = masterArray;
    const fileSuffix = isRequests
      ? "-jbk-parsedRequests.json"
      : "-jbk-responses.json";
    const data = JSON.stringify(temp);

    fs.writeFile(
      `${saveDirectory}/${docId}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log(
            "createArrayOfQuestions - wrror in fs writeFile:",
            err
          );
        }
      }
    );

    updateDB(docId, reqType);
    return temp;
  }

  //****************** Create Array of Interrogatories from Complaint **********************/
  async createArrayOfInterrogatories(
    docId,
    clientPosition,
    reqType = "interrogatories-out"
  ) {
    const masterArray = [];
    const isRequests = false;
    const fdirup = path.resolve(
      process.cwd() + `/Documents/Textfiles/${docId}/`
    );
    console.log(
      "****************** Create Array of Interrogatories from Complaint fdirup for text files:",
      fdirup
    );
    const dirPath = `../Documents/Textfiles/${docId}/`;
    let fileNames = fs.readdirSync(fdirup);

    const dirArray = fileNames.map((name) => {
      return `${fdirup}/${name}`;
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
          const comp = await this.startOne(requestStr, reqType, clientPosition);
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
      flatReq = await this.startOneCreateOutgoing(
        requestStr,
        reqType,
        clientPosition
      );
      try {
        if (flatReq) {
          parsedRequests = JSON.parse(flatReq);
        }
      } catch (err) {
        console.log(
          "Error parsing json in ModelController.createArrayOfQuestions: ",
          err
        );
      }
    }

    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      "RequestsOut",
      `${docId}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });

    const completionsObject = { type: "interrogatories-out" };
    completionsObject["requests"] = parsedRequests;

    masterArray.push(completionsObject);

    let temp = docId;
    temp = masterArray;
    const data = JSON.stringify(temp);
    const fileSuffix = "-jbk-requests-out.json";

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    await sleep(1000);
    try {
      fs.writeFile(
        `${saveDirectory}/${docId}${fileSuffix}`,
        data,
        function (err) {
          if (err) {
            console.log(
              "Error in createArrayOfInterrogatories writeFile:",
              err
            );
          }
        }
      );
    } catch (err) {
      console.log("Error writing file in createArrayOfInterrogatories:", err);
    }
    updateDB(docId, reqType); //need to fix
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
        const comp = await this.startOne(requestStr, reqType, clientPosition);
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
    const directionVar = isRequests ? "Requests" : "Responses";
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      `${directionVar}`,
      `${reqType}`,
      `${docId}`
    );

    fs.mkdir(`${saveDirectory}`, function (err) {
      if (err) {
        console.log("makeDir utilities error creating directory: " + err);
      }
    });

    const completionsObject2 = { type: "combined-numbered" };
    completionsObject2["requests"] = parsedRequests;

    masterArray.push(completionsObject2);

    let temp2 = docId;
    temp2 = masterArray;

    const fileSuffix = isRequests
      ? "-jbk-parsedRequests.json"
      : "-jbk-responses.json";

    fs.writeFile(
      `${saveDirectory}/${docId}${fileSuffix}`,
      data,
      function (err) {
        if (err) {
          return console.log(
            "createArrayOfQuestionsLarge - error in fs writeFile:",
            err
          );
        }
      }
    );
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
        const prompt = createVerboseResponseFromOneQuestionPrompt(request.text);
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: prompt,
        });
        console.log(
          "completion.choices[0].message.content",
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
   *    LLM PROMPT CYCLE
   *    1.  CREATE ARRAY OF Qs FROM STRING BLOB (OF INCOMING REQUESTS -- may deprecate because created startOneCreateOutgoing below)
   *      or
   *    2.  CREATE ARRAY OF OUTGOING Qs FROM COMPLAINT
   *
   */

  async startOne(requestStr, reqType, clientPosition) {
    let prompt;
    console.log(
      "-----0000----00000 -----0000----00000 -----0000----00000 -----0000----00000 -----0000----00000 -----0000----00000 client posiiton, requestType in startOne",
      clientPosition,
      reqType
    );

    if (reqType !== "interrogatories-out") {
      prompt = parseRequestsFromStringBlobPrompt(requestStr);
    } else if (reqType === "interrogatories-out") {
      if (clientPosition == "Plaintiff") {
        prompt = createArrayOfInterrogatoriesPlaintiffPrompt(requestStr);
      } else if (clientPosition == "Defendant") {
        prompt = createArrayOfInterrogatoriesDefendantPrompt(requestStr);
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: prompt,
    });
    console.log(
      "completion.choices[0].message.content",
      completion.choices[0].message.content
    );
    return completion.choices[0].message.content;
  }

  /*
   *    LLM PROMPT CYCLE
   *    CREATE ARRAY OF Qs FROM STRING BLOB (OF INCOMING REQUESTS)
   *
   *
   */

  async startOneCreateOutgoing(
    requestStr,
    reqType,
    isRequests,
    clientPosition
  ) {
    let prompt;

    if (clientPosition?.toLowerCase() === "plaintiff") {
      prompt = createArrayOfInterrogatoriesPlaintiffPrompt(requestStr);
    } else {
      prompt = createArrayOfInterrogatoriesDefendantPrompt(requestStr);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: prompt,
    });
    console.log(
      "completion.choices[0].message.content",
      completion.choices[0].message.content
    );
    return completion.choices[0].message.content;
  }

  // for development
  async testSaveFunction(docId, reqType, isRequests) {
    const directionVar = isRequests ? "Requests" : "Responses";
    const saveDirectory = path.join(
      __dirname,
      "..",
      "Documents",
      `${directionVar}`,
      `${reqType}`,
      `${docId}`
    );
    const fileSuffix = "-jbk-parsedRequests.json";
    console.log("-----------------------------------------");
    console.log("saveDirectory:", saveDirectory);
    console.log("-----------------------------------------");
    console.log(
      "saveDirectory AND FILE",
      `${saveDirectory}/${docId}${fileSuffix}`
    );
    console.log("-----------------------------------------");
  }
}

module.exports = new ModelController();
