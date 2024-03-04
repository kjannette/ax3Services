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
    //console.log("fileinf", fileInfObj);
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
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

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

const tesseCont = new TesseController();
const id = "156b6023-fa85-4dac-a34f-4cdf7f3a5e2e";
tesseCont.executeReadWriteActions(id);
