const fs = require('fs');
const path = require('path');
const Plan = require('../../lib/plan.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);

describe("plan class", () => {
  const simplePlanFilename = fixtureFile('simple-create.plan');
  const planJsonFilename = fixtureFile('simple-create.plan.json');

  it('should parse a file correctly - create', () => {
    const plan = new Plan(simplePlanFilename);
    const planJson = JSON.parse(fs.readFileSync(planJsonFilename));
    expect(plan.plan).toEqual(planJson);
  });

  it('should discover the correct resources when provided a prefix', () => {
    const plan = new Plan(simplePlanFilename);
    const planJson = JSON.parse(fs.readFileSync(planJsonFilename));
    expect(plan.getResources('aws_vpc.main')).toEqual({ 'aws_vpc.main': planJson['aws_vpc.main']});
  });
});
