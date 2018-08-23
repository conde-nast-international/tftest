const { show, cli, program } = require('../../bin/tftest');

const getCommandsLookup = (program) => {
  let lookup = {};
  program.commands.forEach((command, offset) => {
    lookup[command._name] = offset;
  });
  return lookup;
};

describe('tftest', () => {
  describe('program', () => {

    it('program test command with arguments', () => {
      const args = ['test', '-t', 'bla', '-p', 'ble'];
      program.parse(args);
      const lookup = getCommandsLookup(program);
      expect(program.commands[lookup['test']].options[0].required).not.toBeFalsy();
      expect(program.commands[lookup['test']].options[0].flags).toEqual('-t, --terraformFolder <terraformFolder>');
      expect(program.commands[lookup['test']].options[0].short).toEqual('-t');
      expect(program.commands[lookup['test']].options[0].long).toEqual('--terraformFolder');
      expect(program.commands[lookup['test']].options[1].required).not.toBeFalsy();
      expect(program.commands[lookup['test']].options[1].flags).toEqual('-p, --terraformPlan <terraformPlan>');
      expect(program.commands[lookup['test']].options[1].short).toEqual('-p');
      expect(program.commands[lookup['test']].options[1].long).toEqual('--terraformPlan');
      expect(program.commands[lookup['test']].options.length).toEqual(2);
      expect(program.commands[lookup['test']]._description).toEqual('test');
      expect(program.rawArgs).toEqual(args);
    });
    it('program show command with arguments', () => {
      const args = ['show', '-p', 'ble'];
      program.parse(args);
      const lookup = getCommandsLookup(program);
      expect(program.commands[lookup['show']].options[0].required).not.toBeFalsy();
      expect(program.commands[lookup['show']].options[0].flags).toEqual('-p, --terraformPlan <terraformPlan>');
      expect(program.commands[lookup['show']].options[0].short).toEqual('-p');
      expect(program.commands[lookup['show']].options[0].long).toEqual('--terraformPlan');
      expect(program.commands[lookup['show']].options.length).toEqual(1);
      expect(program.commands[lookup['show']]._description).toEqual('show');
      expect(program.rawArgs).toEqual(args);

    });
    it('program show command with arguments', () => {
      const args = ['show-resources', '-p', 'ble'];
      program.parse(args);
      const lookup = getCommandsLookup(program);
      expect(program.commands[lookup['show-resources']].options[0].required).not.toBeFalsy();
      expect(program.commands[lookup['show-resources']].options[0].flags).toEqual('-p, --terraformPlan <terraformPlan>');
      expect(program.commands[lookup['show-resources']].options[0].short).toEqual('-p');
      expect(program.commands[lookup['show-resources']].options[0].long).toEqual('--terraformPlan');
      expect(program.commands[lookup['show-resources']].options.length).toEqual(1);
      expect(program.commands[lookup['show-resources']]._description).toEqual('show-resources');
      expect(program.rawArgs).toEqual(args);

    });
    it('program gettfjson command with arguments', () => {
      const args = ['gettfjson'];
      program.parse(args);
      const lookup = getCommandsLookup(program);
      expect(program.commands[lookup['gettfjson']].options.length).toEqual(0);
      expect(program.commands[lookup['gettfjson']]._argsDescription).toEqual('Download tfjson');
      expect(program.commands[lookup['gettfjson']]._description).toEqual('gettfjson');
      expect(program.rawArgs).toEqual(args);
    });
  });
});
