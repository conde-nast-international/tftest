const child_process = require('child_process');
const { spawnSync } = child_process;
const Flatten = require('./Flatten.js');

const tfjson = (planFilename) => {
  let returnValue = null;
  try {
    const tfjsonOutput = spawnSync('tfjson', [planFilename]);
    if (tfjsonOutput.status !== 0) {
      console.error('Failed to parse tf plan file.');
      returnValue = false;
    } else {
      returnValue = Flatten(JSON.parse(tfjsonOutput.stdout));
    }
  } catch (e) {
    console.error(`Failed to parse tf plan file. ${e}`);
    returnValue = false;
  }
  return returnValue;
};

module.exports = tfjson;
