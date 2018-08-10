const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

class Plan {
  constructor (planFilename) {
    const modulesBinFolder = path.resolve(__dirname, '..', 'node_modules', '.bin');
    const filesInBinFolder = fs.readdirSync(modulesBinFolder);
    console.log(JSON.stringify(filesInBinFolder, null, 2));
    const tfjsonFiles = filesInBinFolder.filter((filename) => (filename.startsWith('tfjson-')));
    console.log(JSON.stringify(tfjsonFiles, null, 2));
    if (tfjsonFiles.length === 0) {
      throw new Error(`Failed to find tfjson in ${modulesBinFolder}`)
    }
    const tfjsonFilename = path.resolve(modulesBinFolder, tfjsonFiles[0]);
    const tfjsonOutput = spawnSync(tfjsonFilename, [planFilename]);
    this.plan = (tfjsonOutput.status === 0) ? this.flattenPlan(JSON.parse(tfjsonOutput.stdout)) : false;
    this.resourceNames = Object.keys(this.plan);
  }

  flattenPlan (inputObject, prefix = '') {
    let rtv = {};
    let keys = Object.keys(inputObject);
    if (keys.length === 1 && /* istanbul ignore next */ keys[0] === 'destroy') {
      /* istanbul ignore next */
      rtv[prefix] = inputObject;
    } else {
      if (prefix !== '') {
        prefix += '.';
      }
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let tmpPrefix = prefix + key;
        if (typeof inputObject[key] === 'object' && (!inputObject[key].hasOwnProperty('destroy_tainted'))) {
          let tmp = this.flattenPlan(inputObject[key], tmpPrefix);
          let tmpKeys = Object.keys(tmp);
          if (tmpKeys.length === 1 && /* istanbul ignore next */ tmpKeys[0] === 'destroy') {
            /* istanbul ignore next */
            rtv[tmpPrefix] = inputObject[key];
          } else {
            for (let j = 0; j < tmpKeys.length; j++) {
              let tmpKey = tmpKeys[j];
              rtv[tmpKey] = tmp[tmpKey];
            }
          }
        } else {
          rtv[tmpPrefix] = inputObject[key];
        }
      }
    }
    return rtv;
  }

  getResources (namePrefix) {
    let names = this.resourceNames.filter((name) => (name.startsWith(namePrefix)));
    let matchedResources = {};
    names.forEach((name) => {
      matchedResources[name] = this.plan[name];
    });
    return matchedResources;
  }
}

module.exports = Plan;
