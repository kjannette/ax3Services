//https://www.npmjs.com/package/csvtojson
//https://www.npmjs.com/package/json-2-csv
const path = require("path");
const json2csv = require("json2csv");
const fs = require("fs");

const csv = require("csvtojson");
const converter = csv({
  noheader: true,
  trim: true,
});

const csvFilePath = "data2.csv";

const codeRoot = "novofreedom-fl24-0";
/*
converter
  .fromFile(csvFilePath)
  .then((jsonArr) => {
    let num = 59;
    const newArr = [];
    jsonArr.forEach((obj) => {
      num = num + 1;
      obj["field9"] = `${codeRoot}${num}`;
      newArr.push(obj);
    });
    return newArr;
  })
  .then((res) => {
    const filePath = path.join(__dirname, "..", "Userinfo");
    const data = JSON.stringify(res);
    fs.writeFile(`${filePath}/userlist.json`, data, function (err) {
      if (err) {
        return console.log("err in csvJson writeFile:", err);
      }
    });
  });
*/

const fileData = fs.readFileSync("prospects.json", "utf8", function (err) {
  console.log("error in readFile", err);
});

const data = JSON.parse(fileData);

json2csv.parseAsync(data).then((csv) => {
  fs.writeFile("prospects.csv", csv, function (err) {
    if (err) throw err;
    console.log("File Saved!");
  });
});

/*
json2csv
  .parseAsync(data, {
    fields: [
      "field1",
      "field2",
      "field3",
      "field4",
      "field5",
      "field6",
      "field7",
      "field8",
      "field9",
    ],
  })
  .then((csv) => {
    fs.writeFile("prospects.csv", csv, function (err) {
      if (err) throw err;
      console.log("File Saved!");
    });
  });
*/
