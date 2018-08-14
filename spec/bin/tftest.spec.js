const { show, cli, program } = require('../../bin/tftest');

describe('tftest', () => {
  describe('show', () => {
    it('should return false', () => {
      expect(show('dummy')).toEqual('false');
    });
    it('Should return json object', () => {
      let result = show('spec/lib/fixtures/simple-create.plan');
      expect (typeof result).toEqual('string');
    });
  });
});
