const fs = require('fs');
const path = require('path');
const Plan = require('../../lib/plan.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);
const fixtureFileInFolder = (folderName, fileName) => path.join(__dirname, 'fixtures', folderName, fileName);

describe("plan class", () => {
  const simplePlanFilename = fixtureFile('simple-create.plan');
  const planJsonFilename = fixtureFile('simple-create.plan.json');

  it('should parse a file correctly - create', () => {
    const plan = new Plan(simplePlanFilename);
    const planJson = JSON.parse(fs.readFileSync(planJsonFilename));
    expect(plan.plan).toEqual(planJson);
  });

// ec2_example_with_changeWindow

  it('should fail to parse a file', () => {
    const plan = new Plan(fixtureFile('simple-create-broken.plan'));
    expect(plan.plan).toEqual(false);
  });

  it('should discover the correct resources when provided a prefix', () => {
    const plan = new Plan(simplePlanFilename);
    const planJson = JSON.parse(fs.readFileSync(planJsonFilename));
    expect(plan.getResources('aws_vpc.main')).toEqual({ 'aws_vpc.main': planJson['aws_vpc.main']});
  });

  describe('has_changes property', () => {
    describe('it should be true', () => {
      it('when creating', () => {
        const plan = new Plan(fixtureFileInFolder('ec2_example', 'plan-create.bin'));
        expect(plan.getResources('aws_instance.ec2_example')['aws_instance.ec2_example'].has_changes).toEqual(true);
      });
      it('when updating in place', () => {
        const plan = new Plan(fixtureFileInFolder('ec2_example', 'plan-update-in-place.bin'));
        expect(plan.getResources('aws_instance.ec2_example')['aws_instance.ec2_example'].has_changes).toEqual(true);
      });
      it('when destroying', () => {
        const plan = new Plan(fixtureFileInFolder('ec2_example', 'plan-destroy.bin'));
        expect(plan.getResources('aws_instance.ec2_example')['aws_instance.ec2_example'].has_changes).toEqual(true);
      });
    });
  });
  describe('it should be false', () => {
    it('when no changes', () => {
      const plan = new Plan(fixtureFileInFolder('ec2_example', 'plan-no-changes.bin'));
      expect(plan.getResources('aws_instance.ec2_example')['aws_instance.ec2_example'].has_changes).toEqual(false);
    });
  });
});
