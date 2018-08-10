const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const tfjsonBin = () => {
  const modulesBinFolder = path.resolve(__dirname, '..', 'node_modules', '.bin');
  const filesInBinFolder = readDir(modulesBinFolder);
  const tfjsonFiles = filesInBinFolder.filter((filename) => (filename.startsWith('tfjson-')));

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

module.exports = {
  tfjsonBin,
  runBin,
  readDir,
  readFile,
  fileExists,
  jsonSafeParse,
  isInChangeWindow
};
