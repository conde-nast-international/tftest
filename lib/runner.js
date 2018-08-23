const debug = require('debug')('runner');
const path = require('path');
const Jasmine = require('jasmine');
const JasmineCore = require('jasmine-core');
const { SpecReporter } = require('jasmine-spec-reporter');

const Plan = require('./plan.js');
const filesystemMethods = require('./filesystem.js');
const libGeneric = require('./generic.js');

class Runner {
  constructor (terraformFolder, terraformPlan) {
    debug('Runner args:', terraformFolder, terraformPlan);
    this.tests = filesystemMethods.discoverTests(terraformFolder);
    this.testResults = {};
    this.plan = new Plan(terraformPlan);
    this.setupJasmine();
    this.executeCallback = null;
    this.numTestsRun = 0;
    this.numTestsExpected = 0;
    this.numTestsFailed = 0;
  }

  setupJasmine () {
    debug('setupJasmine args:');
    const packageJson = libGeneric.readFileSafeJsonParse(path.join(__dirname, '..', 'package.json'));
    if (!packageJson.jasmineConfigRunner) {
      throw new Error('Jasmine config is not present.');
    }
    this.jas = new Jasmine({jasmineCore: JasmineCore});
    this.jasEnv = this.jas.jasmine.getEnv();
    this.jasEnv.clearReporters();
    this.jasEnv.addReporter({ specDone: this.trackSpecEnd.bind(this), jasmineDone: this.trackJasmineEnd.bind(this) });
    this.jasEnv.addReporter(new SpecReporter(packageJson.jasmineConfigRunner));
  }

  trackSpecEnd (result) {
    debug('trackSpecEnd args:', result);
    if (result.status !== 'passed') this.numTestsFailed++;
    this.testResults[result.description] = result.status;
  }

  getTestResult (testName) {
    debug('trackSpecEnd args:', testName);
    return this.testResults[testName];
  }

  trackJasmineEnd (results) {
    debug('trackJasmineEnd args:', results);
    let success = (this.numTestsRun === this.numTestsExpected && this.numTestsFailed === 0 && this.numTestsRun !== 0);
    debug('result success: ', success);
    debug('executeCallback: ', typeof this.executeCallback);
    if (this.executeCallback !== null) this.executeCallback(success);
  }

  execute (callback) {
    debug('execute args:', callback);
    this.executeCallback = callback;
    this.numTestsRun = 0;
    this.numTestsExpected = 0;
    this.testsNotFoundResources = [];
    let self = this;

    for (let i = 0; i < this.tests.length; i++) {
      let test = this.tests[i];
      let testMethod = this.jasEnv.it;
      if (libGeneric.isInChangeWindow(test)) {
        testMethod = this.jasEnv.xit;
      } else {
        this.numTestsExpected += (test.hasOwnProperty('count')) ? test.count * test.tests.length : test.tests.length;
      }
      let resources = this.plan.getResources(test.fullName);
      let resourcesNames = Object.keys(resources);
      if (resourcesNames.length === 0) {
        this.testsNotFoundResources.push(test.fullName);
      } else {
        for (let p = 0; p < resourcesNames.length; p++) {
          let resourceName = resourcesNames[p];
          let resource = resources[resourceName];

          let describeFunc = function () {
            for (let t = 0; t < test.tests.length; t++) {
              let oneTest = test.tests[t];
              self.numTestsRun++;
              testMethod(test.description, oneTest.bind(self.jasEnv, resource, test.args));
            }
          };
          this.jasEnv.describe(test.description, describeFunc.bind(this.jasEnv));
        }
      }
    }
    this.jasEnv.execute();
  }
}

module.exports = Runner;
