const isInChangeWindow = (test) => {
  if (!test.hasOwnProperty('changeWindow')) return false;
  else {
    let now = (new Date()).getTime();
    let fromWindow = (new Date(test.changeWindow.from)).getTime();
    let toWindow = (new Date(test.changeWindow.to)).getTime();
    if (now < toWindow && now > fromWindow) return true;
    else return false;
  }
};

module.exports = {
  isInChangeWindow
};
