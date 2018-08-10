const fs = require('fs');
const path = require('path');
const runner = require('../../lib/runner.js');
const Plan = require('../../lib/plan.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);
const simpleTestFolder = fixtureFile('vpc_example');
const simpleTestPlanBin = path.resolve(simpleTestFolder, 'plan.bin');
const simpleTestPlanJsonFilename = path.resolve(simpleTestFolder, 'plan.bin.json');

describe('the test runner', () => {
  it('should parse a plan to internal property', () => {
    /* let run = new runner(simpleTestFolder, simpleTestPlanBin);
    let planJson = JSON.parse(fs.readFileSync(simpleTestPlanJsonFilename));
    console.log(JSON.stringify(run.plan.plan, null, 2));
    console.log(JSON.stringify(planJson, null, 2));
    // await run.setupJasmine();
    expect(run.plan.plan).toEqual(planJson); */
    const plan = new Plan(simpleTestPlanBin);
    const planJson = JSON.parse(fs.readFileSync(simpleTestPlanJsonFilename));
    expect(plan.plan).toEqual(planJson);
  });
  // it('should record the results of tests correctly', () => {});
  // it('should exit with non-zero if any tests fail', () => {});

});
