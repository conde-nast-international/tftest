const { show, cli, program } = require('../../bin/tftest');

describe('tftest', () => {
  describe('program', () => {
    it('program test command with arguments', () => {
      program.parse(['test', '-t', 'bla', '-p', 'ble']);
      expect(program.commands[0].options[0].required).not.toBeFalsy();
      expect(program.commands[0].options[0].flags).toEqual('-t, --terraformFolder <terraformFolder>');
      expect(program.commands[0].options[0].short).toEqual('-t');
      expect(program.commands[0].options[0].long).toEqual('--terraformFolder');
      expect(program.commands[0].options[1].required).not.toBeFalsy();
      expect(program.commands[0].options[1].flags).toEqual('-p, --terraformPlan <terraformPlan>');
      expect(program.commands[0].options[1].short).toEqual('-p');
      expect(program.commands[0].options[1].long).toEqual('--terraformPlan');
      expect(program.commands[0].options.length).toEqual(2);
      expect(program.commands[0]._description).toEqual('test');
    });
    it('program show command with arguments', () => {
      program.parse(['show', '-p', 'ble']);
      expect(program.commands[1].options[0].required).not.toBeFalsy();
      expect(program.commands[1].options[0].flags).toEqual('-p, --terraformPlan <terraformPlan>');
      expect(program.commands[1].options[0].short).toEqual('-p');
      expect(program.commands[1].options[0].long).toEqual('--terraformPlan');
      expect(program.commands[1].options.length).toEqual(1);
      expect(program.commands[1]._description).toEqual('show');

    });
    it('program gettfjson command with arguments', () => {
      program.parse(['gettfjson']);
      expect(program.commands[2].options.length).toEqual(0);
      expect(program.commands[2]._argsDescription).toEqual('Download tfjson');
      expect(program.commands[2]._description).toEqual('gettfjson');
    });
  });
});
