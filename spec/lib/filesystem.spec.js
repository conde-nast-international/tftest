const fs = require('fs');
const path = require('path');
const { discoverTests } = require('../../lib/filesystem.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);

const vpcFixtureFolder = fixtureFile('vpc_example');
const vpcTestsFile = path.join(vpcFixtureFolder, 'tests.js');
const vpcTestsInnerFile = path.join(vpcFixtureFolder, 'inner', 'tests.js');

const ec2FixtureFolder = fixtureFile('ec2_example');
const ec2TestsFile = path.join(ec2FixtureFolder, 'tests.js');

describe('filesystem', () => {
  describe('discoverTests', () => {

    it('should find the tests on the vpc_example', () => {
      let tests = require(vpcTestsFile);
      tests = tests.concat(require(vpcTestsInnerFile));

      let foundTests = discoverTests(vpcFixtureFolder);
      expect(foundTests).toEqual({tests: tests, missingTests: []});
    });

    it('should find the tests on the ec2_example', () => {
      expect(discoverTests(ec2FixtureFolder)).toEqual({ tests: require(ec2TestsFile), missingTests: [] });
    });
  });
});
