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
    sleep(15000);
    const fileCount = countFiles(`../Documents/Converted/${file}`, file);
    //sleep(1000);
    tesseReader.readMultipleFiles(
      `../Documents/Converted/${file}`,
      `${file}`,
      fileCount
    );
    // Relaunch watcher after 1 sec ***
    sleep(1000);
    watchOnce();
  });
}

watchOnce();
