const generateHead = (title, scripts) => {
  const scriptTags = scripts
    .map((src) => `<script async src="${src}"></script>`)
    .join("");
  return `
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="../style.css" />
      <link rel="icon" href="./favicon.ico" type="image/x-icon" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
      <title>${title}</title>
      ${scriptTags}
    </head>
`;
};

const tempDate = new Date();
const tempArr = tempDate.toString().split("-");
const displayDate = tempArr[0].slice(0, 15);

const generateBody = (subject, content) => {
  const paragraphs = content
    .split("\n")
    .map((p) => `<p class="body-text">${p}</p>`)
    .join("");
  return `
  <body>
    <div class="main-content-container">
      <div class="heading-container">
        <h1 class="blog-heading">${subject}</h1>
        <span class="blog-posted-at">Posted on: ${displayDate}</span>
      </div>
      <div class="body-text-container">
        ${paragraphs}
      </div>
    </div>
  </body>
`;
};

const generateHTML = (pageObject) => {
  const head = generateHead(pageObject.title, pageObject.scripts);
  const body = generateBody(pageObject.subject, pageObject.content);
  return `<!DOCTYPE html>
<html lang="en">
${head}
${body}
</html>
`;
};

module.exports = { generateHTML };
