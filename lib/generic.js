const isInChangeWindow = (test) => {
  if (!test.hasOwnProperty('changeWindow')) return false;
  let now = (new Date()).getTime();
  let fromWindow = (new Date(test.changeWindow.from)).getTime();
  let toWindow = (new Date(test.changeWindow.to)).getTime();
  return (now < toWindow && now > fromWindow) ? true : false;
};

module.exports = {
  isInChangeWindow
};
