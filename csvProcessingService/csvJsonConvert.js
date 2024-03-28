//https://www.npmjs.com/package/csvtojson
//https://www.npmjs.com/package/json-2-csv
//https://stackoverflow.com/questions/72218301/transforming-large-array-of-objects-to-csv-using-json2csv
const path = require("path");
const json2csv = require("json2csv");
const fs = require("fs");
const trialUsers = require("../Constants/trialSignupData.js");
const njFocusList = require("../Constants/njFocusData.js");
const csv = require("csvtojson");

const converter = csv({
  noheader: true,
  trim: true,
});

//const csvFilePath = "data2.csv";

const codeRoot = "novofreedom-fl24-0";
const number = 201;
function convertCsvToJson(csvFilePath, codeRoot) {
  converter
    .fromFile(csvFilePath)
    .then((jsonArr) => {
      let num = number;
      const newArr = [];
      jsonArr.forEach((obj) => {
        let newObj = {};
        const valueArr = Object.values(obj);
        const keysArr = [
          "firstName",
          "lastName",
          "firm",
          "email",
          "city",
          "state",
        ];
        valueArr.forEach((value, i) => {
          newObj[keysArr[i]] = value;
        });
        num = num + 1;
        newObj["description"] = `${codeRootNJ}${num}`;
        newArr.push(newObj);
      });
      return newArr;
    })
    .then((res) => {
      const filePath = path.join(__dirname, "..", "Userinfo");
      const data = JSON.stringify(res);
      fs.writeFile(`./njFocuslist.json`, data, function (err) {
        if (err) {
          return console.log("err in csvJson writeFile:", err);
        }
      });
    });
}

const codeRootNJ = "novolens-nj24-";
const csvFilePath = "./data.csv";

//convertCsvToJson(csvFilePath, codeRootNJ);

//const data = JSON.parse(fileData);
//works for array of objects. one object => one csv row

function convertJsonToCsv(data, fileName) {
  let csv;
  data.forEach((obj, i) => {
    json2csv
      .parseAsync(obj)
      .then((line) => {
        csv += line + "\n";

        return csv;
      })
      .then((csv) => {
        fs.writeFile(`./${fileName}.csv`, csv, function (err) {
          if (err) throw err;
          console.log("File Saved!");
        });
      });
  });
}

const fileName = "njFocusList";
convertJsonToCsv(njFocusList.njFocusList, fileName);

/*
function convertJsonToCsv2(data) {
  
  data.forEach((obj) => {
    json2csv
      .parseAsync(obj, {
        fields: [
          "uuid",
          "firstName",
          "LastName",
          "firm",
          "email",
          "city",
          "state",
          "zip",
          "description",
        ],
      })
      .then((csv) => {
        fs.writeFile("./flRemainingProspects.csv", csv, function (err) {
          if (err) throw err;
          console.log("File Saved!");
        });
      });
  });
}
function convertJsonToCsv(data) {
  json2csv.parseAsync(data).then((csv) => {
    fs.writeFile("flRemainingProspects.csv", csv, function (err) {
      if (err) throw err;
      console.log("File Saved!");
    });
  });
}

*/

/*
function convertJsonToCsv2(data) {
  let csv;
  data.forEach((obj, i) => {
    json2csv
      .parseAsync(obj, {
        fields: [
          "uuid",
          "firstName",
          "lastName",
          "firm",
          "email",
          "city",
          "state",
          "zip",
          "signupCode",
        ],
      })
      .then((line) => {
        csv += line + "\n";
        return csv;
      })
      .then((csv) => {
        console.log(csv);
      });

    
      .then((csv) => {
        fs.writeFile("./flRemainingProspects.csv", csv, function (err) {
          if (err) throw err;
          console.log("File Saved!");
        });
      });
      
    });
  }

  */
