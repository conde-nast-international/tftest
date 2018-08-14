const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { spawnSync } = require('child_process');

const tfjsonBin = () => {
  const modulesBinFolder = path.resolve(__dirname, '..', 'node_modules', '.bin');
  const filesInBinFolder = readDir(modulesBinFolder);
  const tfjsonFiles = filesInBinFolder.filter((filename) => (filename.startsWith('tfjson')));

  if (tfjsonFiles.length !== 0) return path.resolve(modulesBinFolder, tfjsonFiles[0]);
  throw new Error(`Failed to find tfjson in ${modulesBinFolder}`);
};

const runBin = (file, args) => {
  return fileExists(file) ? spawnSync(file, [args]) : null;
};

const readDir = (dir) => {
  try {
    return fs.readdirSync(dir);
  } catch (e) {
    console.error(`Dir does not exist ${e}`);
    return null;
  }
};

const readFile = (filename) => {
  try {
    return fs.readFileSync(filename);
  } catch (e) {
    console.error(`File does not exist ${e}`);
    return null;
  }
};

const fileExists = (filename) => {
  let returnValue = false;
  try {
    fs.statSync(filename);
    returnValue = true;
  } catch (e) {
    console.error(`File does not exist ${e}`);
    returnValue = false;
  }
  return returnValue;
};

const jsonSafeParse = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    console.error(`Cannot parse json ${e}`);
    return null;
  }
};

const isInChangeWindow = (test) => {
  if (!test.hasOwnProperty('changeWindow')) return false;
  if (!test.changeWindow.hasOwnProperty('from')) return false;
  if (!test.changeWindow.hasOwnProperty('to')) return false;
  let now = (new Date()).getTime();
  let fromWindow = (new Date(test.changeWindow.from)).getTime();
  let toWindow = (new Date(test.changeWindow.to)).getTime();
  return !!((now < toWindow && now > fromWindow));
};

const getTfJsonUrl = async (os) => {
  const latestTfJson = 'https://api.github.com/repos/conde-nast-international/tfjson/releases/latest';
  const regex = new RegExp(os);
  const response = await fetch(latestTfJson);
  const json = await response.json();
  const assetsJson = json['assets'];
  const tfJson = assetsJson.map(x => x['browser_download_url']).filter(x => regex.test(x))[0];
  return tfJson;
};

const getTfJson = async (os) => {
  const url = await getTfJsonUrl(os);
  console.log(`fetching from ${url}`);
  return fetch(url)
    .then(res => {
      return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(path.resolve(__dirname, '..', 'node_modules', '.bin', 'tfjson'));
        res.body.pipe(dest);
        res.body.on('error', err => {
          reject(err);
        });
        dest.on('finish', () => {
          resolve();
        });
        dest.on('error', err => {
          reject(err);
        });
      });
    });
};
module.exports = {
  tfjsonBin,
  runBin,
  readDir,
  readFile,
  fileExists,
  jsonSafeParse,
  isInChangeWindow,
  getTfJsonUrl,
  getTfJson
};
