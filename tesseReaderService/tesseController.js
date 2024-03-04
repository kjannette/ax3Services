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
    await fileInfObj.files.forEach(async (file, index) => {
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
              file,
              fileInfObj,
              isComplaint,
              clientPosition
            );
          });
      }
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
  }
}

const tesseCont = new TesseController();
const id = "03be2974-ad64-48b0-90b4-1eb5238aa446";
tesseCont.executeReadWriteActions(id);
