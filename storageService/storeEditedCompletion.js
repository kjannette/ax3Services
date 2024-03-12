const fs = require("fs");
const path = require("path");

async function makeDir(path) {
  console.log("makeDir path", path);
  fs.mkdir(path, function (err) {
    if (err) {
      console.log("makeDir error" + err);
    }
  });
}

function storeDataForGenServices(docId, data) {
  const foo = JSON.stringify(data);
  console.log("o~~~~~~~~~~~~~~~~~~~~~~~~~~~---v foo", foo);
  const saveDirectory = path.join(__dirname, "..", "docGenService", "Docxinfo");
  const filename = `${docId}.json`;
  const savePath = `${saveDirectory}/${filename}`;
  fs.writeFile(savePath, foo, function (err) {
    if (err) {
      return console.log("Error writing in responseHeaderGenerator", err);
    }
  });
}

function storeEditedCompletions(editedComps) {
  const editedCompletes = JSON.stringify(editedComps);
  console.log(
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~storeEditedCompletion"
  );
  let docId = editedComps.id;
  const dir = ` ./docGenService/Docxinfo/${docId}/`;
  const saveDirectory = path.join(__dirname, "..", "docGenService", "Docxinfo");
  try {
    if (fs.existsSync(`./docGenService/Docxinfo/${docId}/`)) {
      let bim;
      const fileData = fs.readdirSync(`EditedCompletions/${docId}/`, "utf8");
      if (fileData.length > 1) {
        let foo = fileData.sort();
        let bar = foo[foo.length - 2];
        const nameArray = bar.split("-");
        const baz = bar.split("-")[5];
        const int = Number(baz) + 1;
        nameArray.splice(5, 6, `${int}`);
        const delimiter = "-";
        const frak = nameArray.reduce((acc, val) =>
          [].concat(acc, delimiter, val)
        );
        const finished = frak.join("");
        var options = { flag: "w" };
        fs.writeFileSync(
          dir + `${finished}-jbk-editedResponses.json`,
          editedCompletes,
          options,
          function (err) {
            if (err) {
              return console.log("Error writing in storeEditedCompletion", err);
            }
          }
        );
        return;
      } else {
        console.log("filedata length of one fired, fileData", fileData);
        let bar = fileData[0];
        console.log("bar", bar);
        const zeroArray = bar.split("-");
        console.log("zeroArray", zeroArray);
        bim = `1`;
        zeroArray.splice(5, 0, bim);
        const delimiter = "-";
        const frak = zeroArray.reduce((acc, val) =>
          [].concat(acc, delimiter, val)
        );
        const finished = frak.join("");
        console.log("finished", finished);
        var options = { flag: "w" };
        fs.writeFileSync(
          dir + `${finished}`,
          editedCompletes,
          options,
          function (err) {
            if (err) {
              return console.log("Error writing in storeEditedCompletion", err);
            }
          }
        );
        return;
      }
    } else {
      console.log(
        "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~else block saveDirectory",
        saveDirectory
      );
      fs.mkdir(saveDirectory, function (err) {
        if (err) {
          console.log("makeDir error" + err);
        }
      });
    }
    var options = { flag: "w" };
    console.log(
      "------------------------------------------------------------------->write file directory: ",
      `${saveDirectory}/${docId}.json`
    );
    fs.writeFileSync(
      `${saveDirectory}/${docId}.json`,
      editedCompletes,
      options,
      function (err) {
        if (err) {
          return console.log("Error writing in storeEditedCompletion", err);
        }
      }
    );
  } catch (err) {
    console.log("Error in store EditedCompletion. Error writing file:", err);
  }
}

module.exports = {
  storeEditedCompletions,
  storeDataForGenServices,
};
