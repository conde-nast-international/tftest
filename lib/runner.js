const Jasmine = require('jasmine');
const JasmineCore = require('jasmine-core');
const Plan = require('./plan.js');
const filesystemMethods = require('./filesystem.js');
const { isInChangeWindow } = require('./generic.js');

class Runner {
  constructor (terraformFolder, terraformPlan) {
    this.tests = filesystemMethods.discoverTests(terraformFolder);
    this.testResults = {};
    this.plan = new Plan(terraformPlan);
    this.setupJasmine();
  }

  setupJasmine () {
    this.jas = new Jasmine({jasmineCore: JasmineCore});
    this.jasEnv = this.jas.jasmine.getEnv();
    this.jasEnv.clearReporters();
    this.jasEnv.addReporter({ specDone: this.trackSpecEnd.bind(this) });
  }

  trackSpecEnd (result) {
    this.testResults[result.description] = result.status;
  }

  getTestResult (testName) {
    /* istanbul ignore next */
    return this.testResults[testName];
  }

  execute (callback) {
    let numTestsRun = 0;
    let numTestsExpected = 0;

    for (let i = 0; i < this.tests.length; i++) {
      let test = this.tests[i];
      let testMethod = this.jasEnv.it;
      /* istanbul ignore next */
      if (isInChangeWindow(test)) {
        testMethod = this.jasEnv.xit;
      } else {
        numTestsExpected += (test.hasOwnProperty('count')) ? test.count * test.tests.length : test.tests.length;
      }
      let resources = this.plan.getResources(test.fullName);
      let resourcesNames = Object.keys(resources);
      for (let p = 0; p < resourcesNames.length; p++) {
        let resourceName = resourcesNames[p];
        let resource = resources[resourceName];

        let describeFunc = function () {
          for (let t = 0; t < test.tests.length; t++) {
            let oneTest = test.tests[t];
            numTestsRun++;
            testMethod(test.description, oneTest.bind(this.jasEnv, resource, test.args));
          }
        };
        this.jasEnv.describe(test.description, describeFunc.bind(this.jasEnv));
      }
    }
    this.jasEnv.afterAll(() => {
      let success = true;
      if (numTestsRun !== numTestsExpected) {
        success = false;
        this.jasEnv.fail(`Invalid number of tests executed: ${numTestsRun} != ${numTestsExpected}`);
      }
      callback(success);
    });
    this.jasEnv.execute();
  }
}

module.exports = Runner;
