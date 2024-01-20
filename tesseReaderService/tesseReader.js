const { createWorker } = require("tesseract.js");
const docParser = require("../docParserService/docParser.js");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

let countWrites = 0;

async function writeFile(file, text, folder, countObject) {
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
  if (countWrites == totalFiles) {
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

async function convert(file, path, folder, countObject) {
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

async function readMultipleFilesLarge(path, folder, countObject, filenames) {
  makeDir(folder);
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
