const debug = require('debug')('generic');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { spawnSync } = require('child_process');

const tfjsonBin = () => {
  debug('tfjsonBin args:');
  const modulesBinFolder = path.resolve(__dirname, '..', 'node_modules', '.bin');
  const filesInBinFolder = readDir(modulesBinFolder);
  const tfjsonFiles = filesInBinFolder.filter((filename) => (filename === 'tfjson'));

  if (tfjsonFiles.length !== 0) return path.resolve(modulesBinFolder, tfjsonFiles[0]);
  throw new Error(`Failed to find tfjson in ${modulesBinFolder}`);
};

const runBin = (file, args) => {
  debug('runBin args:', file, args);
  return fileExists(file) ? spawnSync(file, args) : null;
};

const readDir = (dir) => {
  debug('readDir args:', dir);
  try {
    return fs.readdirSync(dir);
  } catch (e) {
    debug('Dir does not exist', e);
    return null;
  }
};

const readFile = (filename) => {
  debug('readFile args:', filename);
  try {
    return fs.readFileSync(filename);
  } catch (e) {
    debug('File does not exist', e);
    return null;
  }
};

const fileExists = (filename) => {
  debug('fileExists args:', filename);
  let returnValue = false;
  try {
    fs.statSync(filename);
    returnValue = true;
  } catch (e) {
    debug('File does not exist', e);
    returnValue = false;
  }
  return returnValue;
};

const jsonSafeParse = (string) => {
  debug('jsonSafeParse args:', string);
  try {
    return JSON.parse(string);
  } catch (e) {
    debug('Cannot parse json', e);
    return null;
  }
};

const readFileSafeJsonParse = function readFileSafeJsonParse (filename) {
  debug('readFileSafeJsonParse args:', filename);
  return jsonSafeParse(readFile(filename));
};

const isInChangeWindow = (test) => {
  debug('isInChangeWindow args:', test);
  if (!test.hasOwnProperty('changeWindow')) return false;
  if (!test.changeWindow.hasOwnProperty('from')) return false;
  if (!test.changeWindow.hasOwnProperty('to')) return false;
  let now = (new Date()).getTime();
  let fromWindow = (new Date(test.changeWindow.from)).getTime();
  let toWindow = (new Date(test.changeWindow.to)).getTime();
  return !!((now < toWindow && now > fromWindow));
};

const httpJsonGet = async (url) => {
  debug('httpJsonGet args:', url);
  const resp = await fetch(url);
  const json = await resp.json();
  return json;
};

const getTfJsonUrl = async (os, arch, releaseTag) => {
  debug('getTfJsonUrl args:', os, arch, releaseTag);
  let binaryUrl = '';
  const fileString = `${os}-${arch}`;
  const regex = new RegExp(fileString);
  const releases = await httpJsonGet('https://api.github.com/repos/conde-nast-international/tfjson/releases');
  releases.forEach((release) => {
    if (release.tag_name === releaseTag) {
      release.assets.forEach((asset) => {
        if (regex.test(asset.name)) {
          binaryUrl = asset.browser_download_url;
        }
      });
    }
  });
  return binaryUrl;
};

const getTfJson = async (os, arch, release) => {
  debug('getTfJson args:', os, arch, release);
  const url = await getTfJsonUrl(os, arch, release);
  console.log(`fetching tfjson from ${url}`);
  return fetch(url)
    .then(res => new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(path.resolve(__dirname, '..', 'node_modules', '.bin', 'tfjson'));
      res.body.pipe(dest);
      res.body.on('error', reject);
      dest.on('finish', resolve);
      dest.on('error', reject);
    }));
};

const getRunner = (terraformFolder, terraformPlan) => {
  debug('getRunner args:', terraformFolder, terraformPlan);
  let runner = new (require('./runner.js'))(terraformFolder, terraformPlan);
  return runner;
};

module.exports = {
  tfjsonBin,
  runBin,
  readDir,
  readFile,
  fileExists,
  jsonSafeParse,
  readFileSafeJsonParse,
  isInChangeWindow,
  getTfJsonUrl,
  getTfJson,
  getRunner
};
