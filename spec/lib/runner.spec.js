const fs = require('fs');
const path = require('path');
const libGeneric = require('../../lib/generic.js');
const { getRunnerContext, getRunner } = libGeneric;
const Plan = require('../../lib/plan.js');
const Runner = require('../../lib/runner.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);
const simpleTestFolder = fixtureFile('vpc_example');
const simpleTestPlanBin = path.resolve(simpleTestFolder, 'plan.bin');
const simpleTestPlanJsonFilename = path.resolve(simpleTestFolder, 'plan.bin.json');

// expect/spyOn in a global context is somehow being overwritten when embedding...
const specExpect = expect;
const specSpyOn = spyOn;

const getSimplePlan = () => libGeneric.readFileSafeJsonParse(simpleTestPlanJsonFilename);

describe('the test runner', () => {
  let runner = null;

  beforeEach(() => {
    runner = getRunner(simpleTestFolder, simpleTestPlanBin);
  });
  afterEach(() => {
    context = null;
  });

  it('should parse a plan to internal property', () => {
    specExpect(runner.plan.plan).toEqual(getSimplePlan());
  });

  it('should throw an error when jasmineConfigRunner isn\'t present in package.json', (done) => {
    specSpyOn(libGeneric, 'readFileSafeJsonParse').and.returnValue({ 'invalid': 'package.json' });
    try {
      runner = new Runner(simpleTestFolder, simpleTestPlanBin);
      specExpect('jasmineConfigRunner missing didn\'t fail like it should do...').toEqual(true);
      done();
    } catch(e) {
      specExpect(e).toEqual(new Error(`Jasmine config is not present.`));
      done();
    }
  });

  it('should setup jasmine correctly', () => {
    specExpect(runner.plan.plan).toEqual(getSimplePlan());
  });

  it('should execute tests correctly', (done) => {
    // specExpect(runner.plan.plan).toEqual(getSimplePlan());
    runner.execute((success) => {
      specExpect(success).toEqual(true);
      // todo inspect runner.getTestResult(test_name);
      done();
    });
  });

  it('should skip a test when in a changeWindow', (done) => {
    const changeWindowFolder = fixtureFile('ec2_example_with_changeWindow');
    const changeWindowFolderPlanBin = path.resolve(changeWindowFolder, 'plan.bin');
    const changeWindowFolderPlanJsonFilename = path.resolve(changeWindowFolder, 'plan.bin.json');
    const changeWindowPlan = libGeneric.readFileSafeJsonParse(changeWindowFolderPlanJsonFilename);
    const changeWindowTests = require(path.resolve(changeWindowFolder, 'tests.js'));
    let runWrong = getRunner(changeWindowFolder, changeWindowFolderPlanBin);
    specExpect(runWrong.plan.plan).toEqual(changeWindowPlan);
    runWrong.execute(() => {
      const testResult = runWrong.getTestResult(changeWindowTests[0].description);
      specExpect(testResult).toEqual('pending');
      done();
    });
  });


  it('should report when the number of tests is wrong', (done) => {
    const wrongTestsFolder = fixtureFile('ec2_example_with_incorrect_number_of_tests');
    const wrongTestsPlanBin = path.resolve(wrongTestsFolder, 'plan.bin');
    const wrongTestsPlanJsonFilename = path.resolve(wrongTestsFolder, 'plan.bin.json');
    let runWrong = getRunner(wrongTestsFolder, wrongTestsPlanBin);
    specExpect(runWrong.plan.plan).toEqual(libGeneric.readFileSafeJsonParse(wrongTestsPlanJsonFilename));
    runWrong.execute((success) => {
      specExpect(success).toEqual(false);
      done();
    });
  });
});
