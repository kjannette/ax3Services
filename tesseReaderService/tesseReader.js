const { createWorker } = require("tesseract.js");
const docParser = require("../docParserService/docParser.js");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const modelController = require("../agent/ModelController.js");

let countWrites = 0;

async function writeFile(file, text, folder, countObject, isComplaint) {
  const totalFiles = countObject.numberOfFiles;
  const fdirup = path.resolve(process.cwd() + "/Documents/Textfiles");
  console.log(
    "----------------------:::;;;;;;;;;;;;;;;isComplaint in tesse writeFile",
    isComplaint
  );
  const dir = `../Documents/Textfiles/${folder}`;
  try {
    fs.writeFile(
      `${fdirup}/${folder}/${file.split(".")[0]}.txt`,
      text,
      function (err) {
        if (err) {
          return console.log("err in tesseReader writeFile", err);
        }
      }
    );
  } catch (err) {
    console.log("Error writing file:", err);
  }
  countWrites++;
  if (countWrites == totalFiles) {
    if (isComplaint === true) {
      countObject.filePath = `../Documents/Textfiles/${folder}/`;
      modelController.createArrayOfInterrogatories(folder);
      return countObject;
    }
    countWrites = 0;
    docParser.readDir(
      `../Documents/Textfiles/${folder}/`,
      `${folder}`,
      countObject
    );
  }
}

async function writeSingle(folder, text) {
  const fileName = uuidv4();
  try {
    fs.writeFile(
      `../Documents/Textfiles/${folder}/${fileName}.txt`,
      text,
      function (err) {
        if (err) {
          return console.log(err);
        }
      }
    );
  } catch (err) {
    console.log("Error writing file:", err);
  }
}

async function convert(file, path, folder, countObject, isComplaint) {
  const worker = await createWorker();
  const concatPath = `${path}/${file}`;
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_pageseg_mode: "4",
  });

  const {
    data: { text },
  } = await worker.recognize(concatPath);

  writeFile(file, text, folder, countObject, isComplaint);
  await worker.terminate();
}

async function convertBurst(fullFilePath) {
  const worker = await createWorker();

  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_pageseg_mode: "4",
  });

  const {
    data: { text },
  } = await worker.recognize(fullFilePath);

  await worker.terminate();

  return text;
}

async function makeDir(folder) {
  const fdirup = path.resolve(process.cwd() + `/Documents/Textfiles/${folder}`);
  console.log("____________________fdirup in makeDir", fdirup);
  fs.mkdir(fdirup, function (err) {
    if (err) {
      console.log("Error Creating Directory: " + err);
    }
  });
}

async function readMultipleFiles(path, folder, countObject, isComplaint) {
  makeDir(folder);
  fs.readdirSync(path).forEach((file, index) => {
    setTimeout(function () {
      convert(file, path, folder, countObject, isComplaint);
    }, index * 10);
  });
}

async function getMultipleFiles(path, folder, countObject, isComplaint) {
  const fileArr = fs.readdirSync(path);
  //But do you really need readDirSnc at all? YES> Because uuids are generate/files are named in python module

  return fileArr;
  /*
  1. Move below call to iterate with forEach => convert to controller,
  2. Then reutrn a vaL, and call write files from controller\
  3. Then call model controller from controller

  .forEach((file, index) => {
    setTimeout(function () {
      convert(file, path, folder, countObject, isComplaint);
    }, index * 10);
  });
  */
}

async function readMultipleFilesLarge(path, folder, countObject, filenames) {
  makeDir(folder);
  const total = filenames.length;
  const a = filenames.map((name) => {
    return `${path}/${name}`;
  });

  const arrSize = 20;
  let arrays = [];

  while (a.length > 0) {
    arrays.push(a.splice(0, arrSize));
  }
  let count = 0;
  arrays.forEach((array, i) => {
    setTimeout(function () {
      array.forEach(async (fullFilePath) => {
        const text = await convertBurst(fullFilePath);
        writeSingle(folder, text);
        count++;
        if (count === total) {
          determinedDocType = "combined-numbered";
          const isRequests = true;
          modelController.createArrayOfQuestionsLarge(
            folder,
            determinedDocType,
            isRequests
          );
        }
      });
    }, i * 3000);
  });
}

module.exports = {
  writeFile,
  convert,
  readMultipleFiles,
  readMultipleFilesLarge,
  makeDir,
};
