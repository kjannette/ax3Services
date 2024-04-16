const fs = require("fs");
const pageObject = require("./object");
const { generateHTML } = require("./htmlGenerator");

const htmlContent = generateHTML(pageObject);

fs.writeFile("../content/index.html", htmlContent, (err) => {
  if (err) throw err;
  console.log("index.html has been saved!");
});
