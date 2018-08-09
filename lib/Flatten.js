const Flatten = function (inputObject, prefix = '') {
  let rtv = {};
  let keys = Object.keys(inputObject);
  if (keys.length === 1 && keys[0] === 'destroy') {
    rtv[prefix] = inputObject;
  } else {
    if (prefix !== '') {
      prefix += '.';
    }
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let tmpPrefix = prefix + key;
      if (typeof inputObject[key] === 'object' && (!inputObject[key].hasOwnProperty('destroy_tainted'))) {
        let tmp = Flatten(inputObject[key], tmpPrefix);
        let tmpKeys = Object.keys(tmp);
        if (tmpKeys.length === 1 && tmpKeys[0] === 'destroy') {
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
};

module.exports = Flatten;
