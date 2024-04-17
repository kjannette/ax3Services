const fs = require("fs");
const pageObjectsArr = require("./pageObjects");
const path = require("node:path");
const { generateHTML } = require("./htmlGenerator");

objectsTotal = 0;
//if more objects in the array than previous saved number, pop off the last one to make new page

if (pageObjectsArr.length > objectsTotal) {
  const pageObject = pageObjectsArr.pop();
  const htmlContent = generateHTML(pageObject);
  const folderName = pageObject.subject.toLowerCase().replace(" ", "-");

  const _path = path.join(__dirname, "..", "content", `${folderName}`);

  fs.mkdir(_path, function (err) {
    if (err) {
      console.log("index.js makedir error" + err);
    }
  });

  fs.writeFile(`${_path}/index.html`, htmlContent, (err) => {
    if (err) throw err;
    console.log("index.html has been saved!");
  });
}
