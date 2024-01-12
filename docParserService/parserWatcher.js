const fs = require("fs");
const { readDir, parseTextFile } = require("./docParser");

function watchParseSave() {
  const watchPath = "../Documents/Textfiles/";

  fs.watch(watchPath, (eventType, filename) => {
    console.log(eventType);
    console.log(filename);
  });
}

watchParseSave();
