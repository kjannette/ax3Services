const fs = require("fs");
const pageObjectsArr = require("./pageObjects");
const { generateHTML } = require("./htmlGenerator");

let pageObjectsArr = [];
objectsTotal = 1;
//if more objects in the array than previous saved number, pop off the last one to make new page
console.log("pageObjectArr", pageObjectArr);

if (pageObjectsArr.length > objectsTotal) {
  const pageObject = pageObjectsArr.pop();
  const htmlContent = generateHTML(pageObject);
  const folderName = pageObject.subject.toLowerCase().replace(" ", "-");

  const path = path.join(__dirname, "..", "content", `${folderName}`);

  fs.mkdir(path, function (err) {
    if (err) {
      console.log("index.js makedir error" + err);
    }
  });

  fs.writeFile(`${path}/index.html`, htmlContent, (err) => {
    if (err) throw err;
    console.log("index.html has been saved!");
  });
}
