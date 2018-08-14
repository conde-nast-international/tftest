const fs = require('fs');
const path = require('path');
const { getRunnerContext, getRunner } = require('../../lib/generic.js');
const Plan = require('../../lib/plan.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);
const simpleTestFolder = fixtureFile('vpc_example');
const simpleTestPlanBin = path.resolve(simpleTestFolder, 'plan.bin');
const simpleTestPlanJsonFilename = path.resolve(simpleTestFolder, 'plan.bin.json');

// expect in a global context is somehow being overwritten when embedding...
const specExpect = expect;

const getJsonFile = (fn) => JSON.parse(fs.readFileSync(fn));

const getSimplePlan = () => getJsonFile(simpleTestPlanJsonFilename);

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

  it('should setup jasmine correctly', function () {
    specExpect(runner.plan.plan).toEqual(getSimplePlan());
  });

  it('should execute tests correctly', function (done) {
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
    const changeWindowPlan = getJsonFile(changeWindowFolderPlanJsonFilename);
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
    specExpect(runWrong.plan.plan).toEqual(getJsonFile(wrongTestsPlanJsonFilename));
    runWrong.execute((success) => {
      specExpect(success).toEqual(false);
      done();
    });
  });
});
