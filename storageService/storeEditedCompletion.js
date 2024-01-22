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
  const docId = editedComps.id;
  console.log("docId", docId);
  const dir = `EditedCompletions/${docId}/`;

  try {
    if (fs.existsSync(`EditedCompletions/${docId}/`)) {
      console.log("The path exists.");
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
