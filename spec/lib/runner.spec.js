const fs = require('fs');
const path = require('path');
const libGeneric = require('../../lib/generic.js');
const { getRunnerContext, getRunner, readFileSafeJsonParse } = libGeneric;
const Plan = require('../../lib/plan.js');
const Runner = require('../../lib/runner.js');

const getFixturePaths = (folderName, planName) => {
  const folderPath = path.join(__dirname, 'fixtures', folderName);
  return {
    folderPath,
    binFile: path.join(folderPath, `${planName}.bin`),
    jsonFile: path.join(folderPath, `${planName}.bin.json`),
    testsFile: path.join(folderPath, 'tests.js')
  }
};

// expect/spyOn in a global context is somehow being overwritten when embedding...
const specExpect = expect;
const specSpyOn = spyOn;

describe('the test runner', () => {
  let runner = null;
  let paths = null;

  beforeEach(() => {
    paths = getFixturePaths('vpc_example', 'plan');
    runner = getRunner(paths.folderPath, paths.binFile);
  });
  afterEach(() => {
    runner = null;
    paths = null;
  });

  it('should parse a plan to internal property', () => {
    specExpect(runner.plan.plan).toEqual(readFileSafeJsonParse(paths.jsonFile));
  });

  it('should throw an error when jasmineConfigRunner isn\'t present in package.json', (done) => {
    specSpyOn(libGeneric, 'readFileSafeJsonParse').and.returnValue({ 'invalid': 'package.json' });
    try {
      runner = new Runner(paths.folderPath, paths.binFile);
      specExpect('jasmineConfigRunner missing didn\'t fail like it should do...').toEqual(true);
      done();
    } catch(e) {
      specExpect(e).toEqual(new Error(`Jasmine config is not present.`));
      done();
    }
  });

  it('should setup jasmine correctly', () => {
    specExpect(runner.plan.plan).toEqual(readFileSafeJsonParse(paths.jsonFile));
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
    paths = getFixturePaths('ec2_example_with_changeWindow', 'plan');
    let runnerChangeWindow = getRunner(paths.folderPath, paths.binFile);
    specExpect(runnerChangeWindow.plan.plan).toEqual(readFileSafeJsonParse(paths.jsonFile));
    runnerChangeWindow.execute(() => {
      const changeWindowTests = require(path.resolve(paths.testsFile));
      const testResult = runnerChangeWindow.getTestResult(changeWindowTests[0].description);
      specExpect(testResult).toEqual('pending');
      done();
    });
  });


  it('should report when the number of tests is wrong', (done) => {
    paths = getFixturePaths('ec2_example_with_incorrect_number_of_tests', 'plan');
    let runWrong = getRunner(paths.folderPath, paths.binFile);
    specExpect(runWrong.plan.plan).toEqual(readFileSafeJsonParse(paths.jsonFile));
    runWrong.execute((success) => {
      specExpect(success).toEqual(false);
      done();
    });
  });

  describe('should use has_changes', () => {
    it('when there are changes', (done) => {
      const hasChangesPaths = getFixturePaths('ec2_example_using_has_changes', 'plan-update-in-place');
      const changesRunner = getRunner(hasChangesPaths.folderPath, hasChangesPaths.binFile);
      changesRunner.execute((success) => {
        specExpect(success).toEqual(true);
        done();
      });
    });
    it('when there are failing changes', function (done) {
      const hasChangesPaths = getFixturePaths('ec2_example_using_has_changes', 'plan-multiple-tags-changes');
      const changesRunner = getRunner(hasChangesPaths.folderPath, hasChangesPaths.binFile);
      changesRunner.execute((success) => {
        specExpect(success).toEqual(false);
        done();
      });
    });
    it('not when there are no changes', (done) => {
      const hasChangesPaths = getFixturePaths('ec2_example_using_has_changes', 'plan-no-changes');
      const changesRunner = getRunner(hasChangesPaths.folderPath, hasChangesPaths.binFile);
      changesRunner.execute((success) => {
        specExpect(success).toEqual(true);
        done();
      });
    });
  });

  it('should report correctly when it doesn\'t find resources to test', (done) => {
    const incorrectNamePaths = getFixturePaths('ec2_example_incorrect_resource_name', 'plan-no-changes');
    const incorrectRunner = getRunner(incorrectNamePaths.folderPath, incorrectNamePaths.binFile);
    incorrectRunner.execute((success) => {
      specExpect(success).toEqual(false);
      specExpect(incorrectRunner.testsNotFoundResources).toEqual(['aws_instance.ec2_incorrect']);
      done();
    });
  });
});
