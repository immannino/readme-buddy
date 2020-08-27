// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const nodeHtmlToImage = require('node-html-to-image');

const Keyv = require('keyv');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const github = new Keyv('sqlite://.data/sqlite.db', { namespace: 'github' });

const port = process.env.PORT || 3000;

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

app.get("/img/:name", async (req, res) => {
  const name = req.params.name;

  switch (name) {
    case 'page_count':
      handlePageCount(res);
      break;
    case 'image.png':
      handleImage(res);
      break;
    default:
      await fs.createReadStream('./public/banana.svg').pipe(res);
  }
});

async function handleImage(res) {
  const styles = `
    body { color: springgreen; font-size: 20px; background: papayawhip; padding: 1rem; }
  `;

  const image = await nodeHtmlToImage({
    html: `<html><body><div>Check out what I just did! #cool</div><style>${styles}</style></body></html>`
  });
  
  res.writeHead(200, { 'Content-Type': 'image/png' });
  return res.end(image, 'binary');
}

async function handlePageCount(res) {
  let count = await github.get('page_count');

  if (count >= 0) {
    count += 1;
  } else {
    count = 0;
  }

  await github.set('page_count', count);

  const file = getPageCountImage(count);
  
  res.set({
    'content-type': 'image/svg+xml',
    'cache-control': 'max-age=0, no-cache, no-store, must-revalidate'
  })

  return res.end(file);
}

const formatNum = num => String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');

function getPageCountImage(count) {
  let parts = String(count).split('');

  while (parts.length < 9) {
    parts.unshift('0');
  }

  const num = formatNum(parts.join(''));

  return `<svg width="125" height="56" viewBox="0 0 125 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="Group 1">
  <rect id="Rectangle 1" x="0.5" y="0.5" width="124" height="39" fill="#FFF0BA" stroke="#00FFA3"/>
  <g id="0,000,000" filter="url(#filter0_d)">
  <text fill="#0500FF" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="14.5" letter-spacing="0em"><tspan x="13.4316" y="26.25">${num}</tspan></text>
  </g>
  <rect id="Rectangle 2" y="40" width="125" height="16" fill="#00FFA3"/>
  <g id="Page Count" filter="url(#filter1_d)">
  <text fill="#0500FF" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="12" letter-spacing="0em"><tspan x="2" y="50.5">Page Count</tspan></text>
  </g>
  </g>
  <defs>
  <filter id="filter0_d" x="14.4396" y="13.22" width="96.1278" height="16.318" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
  <feOffset dx="1" dy="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.64 0 0 0 1 0"/>
  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
  </filter>
  <filter id="filter1_d" x="3.07999" y="42.48" width="70.9898" height="12.064" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
  <feOffset dx="1" dy="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.64 0 0 0 1 0"/>
  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
  </filter>
  </defs>
  </svg>`;
}

// listen for requests :)
var listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});