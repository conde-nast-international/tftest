const Jasmine = require('jasmine');
const { SpecReporter } = require('jasmine-spec-reporter');
const Plan = require('./plan.js');
const filesystemMethods = require('./filesystem.js');
const { isInChangeWindow } = require('./generic.js');
const path = require('path');
const jasmineConfig = path.resolve(__dirname, '..', 'jasmine.json');

class Runner {
  constructor (terraformFolder, terraformPlan) {
    this.tests = filesystemMethods.discoverTests(terraformFolder);
    this.testResults = {};
    this.plan = new Plan(terraformPlan);
  }

  setupJasmine () {
    this.jas = new Jasmine();
    this.jas.loadConfigFile(jasmineConfig);
    this.jas.env.clearReporters();
    this.jas.env.addReporter(new SpecReporter(jasmineConfig));
    this.jas.env.addReporter({ specDone: this.trackSpecEnd.bind(this) });
  }

  trackSpecEnd (result) {
    this.testResults[result.description] = result.status;
  }

  getTestResult (testName) {
    return this.testResults[testName];
  }

  execute () {
    let jas = this.jas;
    let numTestsRun = 0;
    let numTestsExpected = 0;

    for (let i = 0; i < this.tests.length; i++) {
      let test = this.tests[i];
      let testMethod = jas.env.it;
      if (isInChangeWindow(test)) {
        testMethod = jas.env.xit;
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
            testMethod(test.description, oneTest.bind(jas.env, resource, test.args));
          }
        };
        jas.env.describe(test.description, describeFunc.bind(jas.env));
      }
    }
    jas.env.afterAll(() => {
      if (numTestsRun !== numTestsExpected) {
        jas.env.fail(`Invalid number of tests executed: ${numTestsRun} != ${numTestsExpected}`);
      }
    });
    jas.execute();
  }
}

module.exports = Runner;
