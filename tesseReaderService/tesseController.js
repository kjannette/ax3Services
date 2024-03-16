const path = require("path");
const fs = require("fs");
const tesseReader = require("./tesseReader.js");
const { getDoc } = require("../firebase/firebase.js");

class TesseController {
  async makeDir(folder) {
    const fdirup = path.join(
      __dirname,
      "..",
      "Documents",
      "Textfiles",
      `${folder}`
    );

    fs.mkdir(fdirup, function (err) {
      if (err) {
        console.log("Error Creating Directory: " + err);
      }
    });
  }

  async createObj(file) {
    console.log("fdirup", fdirup);

    // console.log("---------------------------------------fileNames", fileNames);
  }

  async executeReadWriteActions(
    id,
    isComplaint = false,
    clientPosition = "Plaintiff",
    novosValue = 2
  ) {
    const fdirup = path.join(
      __dirname,
      "..",
      "Documents",
      "Converted",
      `${id}`
    );
    const countObject = {};
    countObject.fileName = id;
    let fileNames = fs.readdirSync(fdirup);
    countObject.files = fileNames;
    countObject.path = fdirup;
    countObject.numberOfFiles = fileNames.length;
    countObject.clientPosition = clientPosition;
    countObject.novosValue = novosValue;

    this.makeDir(id);

    function callConvert(
      file,
      path,
      id,
      countObject,
      isComplaint,
      clientPosition,
      index
    ) {
      tesseReader
        .convert(file, countObject, isComplaint, clientPosition)
        .then((text) => {
          tesseReader.writeFile(
            file,
            text,
            id,
            countObject,
            isComplaint,
            clientPosition
          );
        });
    }

    countObject.files.forEach(async (file, index) => {
      setTimeout(
        callConvert,
        index * 10,
        file,
        countObject.path,
        id,
        countObject,
        isComplaint,
        clientPosition
      );
    });
    return JSON.stringify({ status: "OK" });
  }
}

const tesseCont = new TesseController();

module.exports = new TesseController();

/*

const id = "5f9d7844-584d-46d5-bd0a-e1ac6ff0c06d";
const isComplaint = true;

tesseCont.executeReadWriteActions(id, isComplaint);


    function sleep(ms) {
      console.log("sleep called");
      return new Promise((resolve) => setTimeout(resolve, ms));
    }


*/
