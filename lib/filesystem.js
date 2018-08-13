const path = require('path');
const { readFile, fileExists, jsonSafeParse } = require('./generic.js');

let discoveredModules = {};

const discoverModules = (baseFolder) => {
  if (discoveredModules[baseFolder] === undefined) {
    discoveredModules[baseFolder] = {};
    const modulesJsonFileName = path.join(baseFolder, '.terraform', 'modules', 'modules.json');
    if (fileExists(modulesJsonFileName)) {
      let modulesJson = { Modules: [] };
      let modulesString = readFile(modulesJsonFileName);
      let tmpModules = jsonSafeParse(modulesString);
      if (tmpModules !== null) {
        modulesJson = tmpModules;
        for (let i = 0; i < modulesJson.Modules.length; i++) {
          let module = modulesJson.Modules[i];
          let moduleName = module.Root;
          if (moduleName === '') {
            let keyParts = module.Key.split(';');
            moduleName = keyParts[1];
          }
          discoveredModules[baseFolder][moduleName] = module.Dir;
        }
      }
    }
  }
  return discoveredModules[baseFolder];
};

const getFolderTests = (baseFolder, folderName, prefix = '') => {
  let modules = discoverModules(baseFolder);
  let tests = [];
  const testsFile = path.join(folderName, 'tests.js');
  const modulesFile = path.join(folderName, 'modules.js');
  if (fileExists(testsFile)) {
    let tmpTests = require(testsFile);
    tmpTests.forEach((test) => {
      test.prefix = prefix;
      test.fullName = test.name;
      if (prefix !== '') {
        test.fullName = `${prefix}.${test.name}`;
      }
      tests.push(test);
    });
  }
  if (fileExists(modulesFile)) {
    let tmpModules = require(modulesFile);
    tmpModules.forEach((module) => {
      /* istanbul ignore next */
      let tmpPrefix = (prefix !== '') ? `${prefix}.${module.prefix}` : module.prefix;
      if (modules.hasOwnProperty(module.name)) {
        let modDir = path.join(baseFolder, modules[module.name], module.name);
        let tmpTests = getFolderTests(baseFolder, modDir, tmpPrefix);
        tests = tests.concat(tmpTests);
        modDir = path.join(baseFolder, modules[module.name]);
        tmpTests = getFolderTests(baseFolder, modDir, tmpPrefix);
        tests = tests.concat(tmpTests);
      }
    });
  }
  return tests;
};

const discoverTests = (baseFolder) => {
  return getFolderTests(baseFolder, baseFolder);
};

module.exports = {
  discoverTests
};
