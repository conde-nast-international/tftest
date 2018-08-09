// jasmine terraform runner
const path = require('path');
const Jasmine = require('jasmine');
const { SpecReporter } = require('jasmine-spec-reporter');
const filesystemMethods = require('./filesystem.js');
const Plan = require('./plan.js');
const { isInChangeWindow } = require('./generic.js');

const runner = function (terraformFolder, terraformPlan) {
  const jas = new Jasmine();
  const configDir = path.resolve(__dirname, '..', 'config');
  jas.loadConfigFile(path.resolve(configDir, 'jasmine.json'));

  jas.env.clearReporters();
  jas.env.addReporter(new SpecReporter(require(path.resolve(configDir, 'spec-reporter.json'))));

  let tests = filesystemMethods.discoverTests(terraformFolder);
  let plan = new Plan(terraformPlan);

  let numTestsRun = 0;
  let numTestsExpected = 0;

  for (let i = 0; i < tests.length; i++) {
    let test = tests[i];
    let testMethod = jas.env.it;
    if (isInChangeWindow(test)) {
      testMethod = jas.env.xit;
    } else {
      numTestsExpected += (test.hasOwnProperty('count')) ? test.count * test.tests.length : test.tests.length;
    }
    let resources = plan.getResources(test.fullName);

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
};

module.exports = runner;
