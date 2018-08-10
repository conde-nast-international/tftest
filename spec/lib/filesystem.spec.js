const path = require('path');
const fs = require('fs');
const { fileExists, discoverTests, jsonSafeParse } = require('../../lib/filesystem.js');
const fixtureFile = (fileName) => path.join(__dirname, 'fixtures', fileName);

describe('filesystem', () => {
  describe('jsonSafeParse', () => {
    it('should parse and return an object - successfully', () => {
      let output = jsonSafeParse('[]');
      expect(output).toEqual([]);
    });
    it('should parse and return an object - unsuccessfully', () => {
      let output = jsonSafeParse('[');
      expect(output).toEqual(null);
    });
  });
  describe('fileExists', () => {
    it('returns true when a file does exist', () => {
      expect(fileExists(__filename)).toEqual(true);
    });
    it("returns false when a file doesn't exist", () => {
      expect(fileExists('file_that_doesnt_exist.txt')).toEqual(false);
    });
  });
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
