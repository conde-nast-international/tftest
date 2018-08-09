#!/usr/bin/env node

const pck = require('../package.json');
const fs = require('fs');
const path = require('path');
const program = require('commander');

const tfjson = require('../lib/tfjson.js');
const tftest = require('../lib/tftest.js');
const modulePath = path.join(__dirname, '..', 'example', 'modules');

const allItemsResultTrue = (results) => {
  const testLen = results.length;
  const passedArr = results.filter((item) => (item.result === true));
  const passedNumber = passedArr.length;
  return (testLen === passedNumber);
};

const fileExists = (filename) => {
  let returnValue = false;
  try {
    returnValue = true;
  } catch (e) {
    returnValue = false;
  }
  return returnValue;
};

const discoverTestFile = () => {
  let testFiles = [];
  const cwd = process.cwd();
  const cwdTest = path.join(cwd, 'tests.js');
  if (fileExists(cwdTest)) testFiles.push(cwdTest);
  return testFiles;
};

const discoverModules = () => {
  let modules = {};
  const cwd = process.cwd();
  const modulesJsonFileName = path.join(cwd, '.terraform', 'modules', 'modules.json');
  const modulesJson = JSON.parse(fs.readFileSync(modulesJsonFileName));
  for (let i = 0; i < modulesJson.Modules.length; i++) {
    let module = modulesJson.Modules[i];
    let tmpModule = {
      name: module.Root,
      dir: module.Dir,
      testFile: ''
    };
    let moduleTestsJsonFileName = path.join(cwd, module.Dir, module.Root, 'tests.js');
    if (fileExists(moduleTestsJsonFileName)) tmpModule.testFile = moduleTestsJsonFileName;
    modules[tmpModule.name] = tmpModule;
  }
  return modules;
};

const displayTestResults = (results) => {
  if (allItemsResultTrue(results)) {
    console.log('All tests passed.');
    process.exit(0);
  } else {
    console.error('Failed tests:-');
    results.map((item) => {
      if (item.result === false) {
        console.error(`  ${item.test.name}`);
      }
    });
    process.exit(1);
  }
};

const runTestRunner = async (planFilename, testFilename = null) => {
  let planJson = null;
  try {
    const parseResult = await tfjson(planFilename);
    if (parseResult === false) throw new Error('Failed to parse tf plan.');
    else {
      planJson = parseResult;
    }
  } catch (e) {
    console.error('Failed to parse terraform plan file', e);
    process.exit(1);
  }
  let testResults = [];
  if (testFilename === null) {
    const discoveredTestFiles = discoverTestFile();
    if (discoveredTestFiles.length === 0) {
      console.error('Failed to find tests.js file.');
    } else {
      let modules = discoverModules();
      let testResultsMulti = [];
      for (let i = 0; i < discoveredTestFiles.length; i++) {
        let tmpTestResults = await tftest(discoveredTestFiles[i], planJson, modules);
        testResultsMulti = testResultsMulti.concat(tmpTestResults);
      }
      testResults = testResultsMulti;
    }
  } else {
    if (fileExists(testFilename)) {
      testResults = await tftest(testFilename, planJson, modulePath);
    } else {
      console.error(`Failed to find file: ${testFilename}`);
      process.exit(1);
    }
  }
  displayTestResults(testResults);
};

program.version(pck.version);

program.command('test <planFilename> [testFilename]')
  .description('Run test')
  .action(runTestRunner);

program.parse(process.argv);
