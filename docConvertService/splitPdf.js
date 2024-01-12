import pdf2image from "pdf2image";

//The converter uses the same options as the convertPDF function
var converter = pdf2image.compileConverter({
  density: 200,
  quality: 100,
  outputFormat: "%s_page_%d",
  outputType: "png",
});

//Converts a single pdf
converter.convertPDF("badRogs.pdf");

//Converts multiple pdfs
//converter.convertPDFList(["example1.pdf", "example1.pdf"]);

/*
const { fromPath } = require("pdf2pic");
const pdf = require("pdf-page-counter");
const fs = require("fs");

const split = () => {
  const { filename } = "./badRogs.pdf";
  const options = {
    density: 100,
    saveFilename: "file",
    savePath: "./converted",
    format: "png",
    width: 600,
    height: 600,
  };
  const storeAsImage = fromPath(`./converted/${filename}`, options);
  let dataBuffer = fs.readFileSync(`./converted/${filename}`);
  pdf(dataBuffer).then(function (data) {
    for (
      var pageToConvertAsImage = 1;
      pageToConvertAsImage <= data.numpages;
      pageToConvertAsImage++
    ) {
      storeAsImage(pageToConvertAsImage).then((resolve) => {
        return resolve;
      });
    }
    res.send({
      filename: filename,
    });
  });
};
*/
