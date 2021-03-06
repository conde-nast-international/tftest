const debug = require('debug')('plan');
const { tfjsonBin, runBin, jsonSafeParse } = require('./generic.js');

class Plan {
  constructor (planFilename) {
    debug('Plan args:', planFilename);
    this.plan = runBin(tfjsonBin(), [planFilename]);
    this.plan = (this.plan.status === 0) ? this.flattenPlan(jsonSafeParse(this.plan.stdout)) : false;
    this.resourceNames = Object.keys(this.plan);
    if (this.plan !== false) {
      this.addHasChangesToPlan();
    }
  }

  flattenPlan (inputObject, prefix = '') {
    debug('flattenPlan args:', inputObject, prefix);
    let rtv = {};
    let keys = Object.keys(inputObject);
    if (prefix !== '') {
      prefix += '.';
    }
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let tmpPrefix = prefix + key;
      if (typeof inputObject[key] === 'object' && (!inputObject[key].hasOwnProperty('destroy_tainted'))) {
        let tmp = this.flattenPlan(inputObject[key], tmpPrefix);
        let tmpKeys = Object.keys(tmp);
        for (let j = 0; j < tmpKeys.length; j++) {
          let tmpKey = tmpKeys[j];
          rtv[tmpKey] = tmp[tmpKey];
        }
      } else {
        rtv[tmpPrefix] = inputObject[key];
      }
    }
    return rtv;
  }

  addHasChangesToPlan () {
    debug('addHasChangesToPlan');
    for (let k = 0; k < this.resourceNames.length; k++) {
      let resName = this.resourceNames[k];
      if (!resName.endsWith('destroy')) {
        this.plan[resName].has_changes = (this.plan[resName].destroy) || (Object.keys(this.plan[resName].new ? this.plan[resName].new : []).length > 0);
      }
    }
  }

  getResources (namePrefix) {
    debug('getResources args:', namePrefix);
    let names = this.resourceNames.filter((name) => (name.startsWith(namePrefix)));
    let matchedResources = {};
    names.forEach((name) => {
      matchedResources[name] = this.plan[name];
    });
    return matchedResources;
  }
}

module.exports = Plan;
