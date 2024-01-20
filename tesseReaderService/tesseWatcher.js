const fs = require("fs");
const tesseReader = require("./tesseReader.js");
var sleep = require("system-sleep");

const directory = "../Documents/Converted/";

function countFiles(directory, file) {
  let fileCount = {};
  fileCount.fileName = file;
  fs.readdir(directory, (err, files) => {
    fileCount.numberOfFiles = files.length;
  });
  return fileCount;
}

async function watchOnce() {
  const watcher = fs.watch(directory, (event, file) => {
    watcher.close();
    sleep(10000);

    const fileCount = countFiles(`../Documents/Converted/${file}`, file);
    const filenames = fs.readdirSync(`../Documents/Converted/${file}`);

    if (filenames.length < 1) {
      sleep(55000);

      const filenames = fs.readdirSync(`../Documents/Converted/${file}`);
      let fileCount = {};
      fileCount.fileName = file;
      fileCount.numberOfFiles = filenames.length;

      tesseReader.readMultipleFilesLarge(
        `../Documents/Converted/${file}`,
        `${file}`,
        fileCount,
        filenames
      );

      sleep(1000);
      watchOnce();
    } else {
      tesseReader.readMultipleFiles(
        `../Documents/Converted/${file}`,
        `${file}`,
        fileCount
      );
    }

    // Relaunch watcher after 1 sec ***
    sleep(1000);
    watchOnce();
  });
}

watchOnce();
