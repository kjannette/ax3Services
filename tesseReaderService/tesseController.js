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
    clientPosition = "Plaintiff"
  ) {
    const fdirup = path.join(
      __dirname,
      "..",
      "Documents",
      "Converted",
      `${id}`
    );
    let fileInfObj = {};
    fileInfObj.fileName = id;
    let fileNames = fs.readdirSync(fdirup);
    fileInfObj.files = fileNames;
    fileInfObj.path = fdirup;
    fileInfObj.numberOfFiles = fileNames.length;

    console.log("fileInfoObj", fileInfObj);
    this.makeDir(id);

    let masterArr = [];

    function callConvert(
      file,
      path,
      id,
      fileInfObj,
      isComplaint,
      clientPosition,
      index
    ) {
      tesseReader
        .convert(
          file,
          fileInfObj.path,
          id,
          fileInfObj,
          isComplaint,
          clientPosition
        )
        .then((text) => {
          tesseReader.writeFile(
            file,
            text,
            id,
            fileInfObj,
            isComplaint,
            clientPosition
          );
        });
    }

    await fileInfObj.files.forEach(async (file, index) => {
      setTimeout(
        callConvert,
        index * 10,
        file,
        fileInfObj.path,
        id,
        fileInfObj,
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
