const fs = require('fs');
const path = require('path');

const tfjson = require('./tfjson.js');

const fileExists = (filename) => {
  let returnValue = false;
  try {
    let tmpStat = fs.statSync(filename);
    returnValue = true;
  } catch (e) {
    returnValue = false;
  }
  return returnValue;
};

let discoveredModules = null;

const discoverModules = () => {
  if (discoveredModules === null) {
    discoveredModules = {};
    const cwd = process.cwd();
    const modulesJsonFileName = path.join(cwd, '.terraform', 'modules', 'modules.json');
    const modulesJson = JSON.parse(fs.readFileSync(modulesJsonFileName));
    for(let i = 0; i < modulesJson.Modules.length; i++) {
      let module = modulesJson.Modules[i];
      discoveredModules[module.Root] = module.Dir;
    }
  }
  return discoveredModules;
};

const getFolderTests = (folderName, prefix = '') => {
  let modules = discoverModules();
  let tests = [];
  const testsFile = path.join(folderName, 'tests.js');
  const modulesFile = path.join(folderName, 'modules.js');
  if (fileExists(testsFile)) {
    let tmpTests = require(testsFile);
    tmpTests.forEach((test) => {
      test.prefix = prefix;
      tests.push(test);
    });
  }
  if (fileExists(modulesFile)) {
    let tmpModules = require(modulesFile);
    tmpModules.forEach((module) => {
      let modName = module[0];
      let modPrefix = module[1];
      let tmpPrefix = modPrefix;
      if (prefix !== '') {
        tmpPrefix = `${prefix}.${modPrefix}`
      }
      if (modules.hasOwnProperty(modName)) {
        let modDir = path.join(process.cwd(), modules[modName], modName);
        let tmpTests = getFolderTests(modDir, tmpPrefix);
        tests = tests.concat(tmpTests);
      }
    });
  }
  return tests;
};

const discoverTests = () => {
  return getFolderTests(process.cwd());
};

module.exports = {
  discoverTests,
  loadPlanFile: tfjson
};
