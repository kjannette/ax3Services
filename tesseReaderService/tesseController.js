const path = require("path");
const fs = require("fs");
const tesseReader = require("./tesseReader.js");

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

  async countFiles(file) {
    var fdirup = path.join(
      __dirname,
      "..",
      "Documents",
      "Converted",
      `${file}`
    );
    let fileCount = [{}];
    fileCount.fileName = file;
    let fileNames = fs.readdirSync(fdirup);
    fileCount["files"] = fileNames;
    fileCount["path"] = fdirup;
    fileCount["numberOfFiles"] = fileNames.length;
    return fileCount;
  }

  async executeReadWriteActions(
    id,
    isComplaint = false,
    clientPosition = "Plaintiff"
  ) {
    const fileInfObj = await this.countFiles(id);
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

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
        index * 20,
        file,
        fileInfObj.path,
        id,
        fileInfObj,
        isComplaint,
        clientPosition
      );
    });
  }
}

module.exports = new TesseController();
