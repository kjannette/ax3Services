const fs = require("fs");
const path = require("path");

async function makeDir(path) {
  fs.mkdir(path, function (err) {
    if (err) {
      console.log("makeDir error" + err);
    }
  });
}

function storeEditedCompletions(editedComps) {
  const editedCompletes = JSON.stringify(editedComps);
  console.log(
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~storeEditedCompletion"
  );
  let docId = editedComps.id;
  console.log("docId", docId);
  const dir = `EditedCompletions/${docId}/`;

  try {
    if (fs.existsSync(`EditedCompletions/${docId}/`)) {
      let temp = docId;
      let bim;
      const fileData = fs.readdirSync(`EditedCompletions/${docId}/`, "utf8");
      console.log("fileData", fileData);
      let foo = fileData.sort();
      let bar = foo[foo.length - 1];
      console.log("bar.split('-')[5]", bar.split("-")[5]);
      const nameArray = bar.split("-");
      const baz = bar.split("-")[5];
      if (baz === "jbk") {
        bim = `1`;
        nameArray.splice(5, 0, bim);
        const newone = nameArray.join("", "-");
        console.log("~~~~~newone", newone);
        const delimiter = "-";
        const frak = nameArray.reduce((acc, val) =>
          [].concat(acc, delimiter, val)
        );
        console.log("frak", frak.join(""));
        const finished = frak.join("");
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
      } else {
        bim = `-1-`;
        nameArray.splice(4, 0, bim);
        nameArray.join();
        console.log("nameArray", nameArray);
      }
    } else {
      makeDir(dir);
    }
    var options = { flag: "w" };
    fs.writeFileSync(
      dir + `${docId}-jbk-editedResponses.json`,
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
};
