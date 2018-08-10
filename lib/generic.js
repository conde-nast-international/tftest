const fs = require('fs');

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
  let now = (new Date()).getTime();
  let fromWindow = (new Date(test.changeWindow.from)).getTime();
  let toWindow = (new Date(test.changeWindow.to)).getTime();
  return !!((now < toWindow && now > fromWindow));
};

module.exports = {
  readDir,
  readFile,
  fileExists,
  jsonSafeParse,
  isInChangeWindow
};
