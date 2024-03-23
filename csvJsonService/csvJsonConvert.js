//https://www.npmjs.com/package/csvtojson
//https://www.npmjs.com/package/json-2-csv

const request = require("request");
const csv = require("csvtojson");

function onError(err) {
  console.log(err);
}

function onComplete() {
  console.log("done");
}

csv()
  .fromStream(request.get("./data.csv"))
  .subscribe(
    (json) => {
      return new Promise((resolve, reject) => {
        // long operation for each json e.g. transform / write into database.
      }).then((res) => {
        console.log(res);
      });
    },
    onError,
    onComplete
  );
