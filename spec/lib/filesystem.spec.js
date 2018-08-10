const path = require('path');
const { discoverTests } = require('../../lib/filesystem.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);

describe('filesystem', () => {
  describe('discoverTests', () => {
    it('should find the tests on the vpc_example', () => {
      const fixtureFolder = fixtureFile('vpc_example');
      let tests = require(path.join(fixtureFolder, 'tests.js'));
      tests = tests.concat(require(path.join(fixtureFolder, 'inner', 'tests.js')));
      expect(discoverTests(fixtureFolder)).toEqual(tests);
    });
    it('should find the tests on the ec2_example', () => {
      const fixtureFolder = fixtureFile('ec2_example');
      expect(discoverTests(fixtureFolder)).toEqual(require(path.join(fixtureFolder, 'tests.js')));
    });
  });
});
