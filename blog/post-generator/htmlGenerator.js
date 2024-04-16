const generateHead = (title, scripts) => {
  const scriptTags = scripts.map(src => `<script async src="${src}"></script>`).join('');
  return `
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="./style.css" />
  <link rel="icon" href="./favicon.ico" type="image/x-icon" />
  <title>${title}</title>
  ${scriptTags}
</head>
`;
};

const generateBody = (subject, content) => {
  const paragraphs = content.split('\n').map(p => `<p class="body-text">${p}</p>`).join('');
  return `
<body>
  <div class="main-content-container">
    <h1>${subject}</h1>
    ${paragraphs}
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