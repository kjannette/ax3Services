const { createWorker } = require("tesseract.js");
const docParser = require("../docParserService/docParser.js");
// const { readDir, parseTextFiles } = require("../docParserService/docParser.js");
const fs = require("fs");
const path = require("path");

let countWrites = 0;

async function writeFile(file, text, folder, countObject) {
  console.log("+++++++++++++++++++++++++++++++++tesse writeFile called");
  const totalFiles = countObject.numberOfFiles;
  const dir = `../Documents/Textfiles/${folder}`;
  try {
    fs.writeFile(
      `../Documents/Textfiles/${folder}/${file.split(".")[0]}.txt`,
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
  countWrites++;
  console.log(
    "teeReader writeFile countWrites, totalFiles",
    countWrites,
    totalFiles
  );
  if (countWrites == totalFiles) {
    countWrites = 0;
    docParser.readDir(
      `../Documents/Textfiles/${folder}/`,
      `${folder}`,
      countObject
    );
  }
}

async function convert(file, path, folder, countObject) {
  console.log(
    "-----------------------------------------------tesse convert called"
  );
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

  writeFile(file, text, folder, countObject);
  await worker.terminate();
}

async function makeDir(folder) {
  fs.mkdir(`../Documents/Textfiles/${folder}`, function (err) {
    if (err) {
      console.log("Error Creating Directory: " + err);
    }
  });
}

async function readMultipleFiles(path, folder, countObject) {
  makeDir(folder);
  fs.readdirSync(path).forEach((file, index) => {
    setTimeout(function () {
      convert(file, path, folder, countObject);
    }, index * 10);
  });
}

module.exports = {
  writeFile,
  convert,
  readMultipleFiles,
  makeDir,
};
