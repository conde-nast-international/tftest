const debug = require('debug')('filesystem');
const path = require('path');
const { readFile, fileExists, jsonSafeParse } = require('./generic.js');

let discoveredModules = {};

const discoverModules = (baseFolder) => {
  debug('discoverModules args:', baseFolder);
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
  debug('getFolderTests args:', baseFolder, folderName, prefix);
  let modules = discoverModules(baseFolder);
  let tests = [];
  let moduleTests = [];
  const testsFile = path.join(folderName, 'tests.js');
  const modulesFile = path.join(folderName, 'modules.js');
  if (fileExists(testsFile)) {
    let tmpTests = require(testsFile);
    tmpTests.forEach((test) => {
      test.fullName = test.name;
      if (prefix !== '') {
        test.prefix = prefix;
        test.fullName = `${prefix}.${test.name}`;
      }
      tests.push(test);
    });
  }
  if (fileExists(modulesFile)) {
    let tmpModules = require(modulesFile);
    let tmpModuleTests = null;
    tmpModules.forEach((module) => {
      let tmpPrefix = (prefix !== '') ? `${prefix}.${module.prefix}` : module.prefix;
      if (modules.hasOwnProperty(module.name)) {
        let modDir = path.join(baseFolder, modules[module.name]);
        tmpModuleTests = getFolderTests(baseFolder, modDir, tmpPrefix);
        moduleTests = moduleTests.concat(tmpModuleTests);
        if (moduleTests.length === 0) {
          modDir = path.join(baseFolder, modules[module.name], module.name);
          tmpModuleTests = getFolderTests(baseFolder, modDir, tmpPrefix);
          moduleTests = moduleTests.concat(tmpModuleTests);
        }
      }
    });
  }
  tests = tests.concat(moduleTests);
  return tests;
};

const discoverTests = (baseFolder) => {
  debug('discoverTests args:', baseFolder);
  return getFolderTests(baseFolder, baseFolder);
};

module.exports = {
  discoverTests
};
