const fs = require('fs');
const path = require('path');

const getObjectAction = (obj, params) => {
  const keys = Object.keys(obj);
  if (obj.destroy === true) {
    if (keys.length > 2) return "destroy_recreate";
    else return "destroy";
  } else {
    if (keys.length == params.create_arg_count) return "create";
    return "upgrade";
  }
};

const hasDestroyProperty = (obj) => {
  return obj.hasOwnProperty('destroy');
}

const runATest = (test, plan, args) => new Promise(async (resolve, reject) => {
  let testResults = [];
  const planObjects = Object.keys(plan);
  for(let i = 0; i < planObjects.length; i++) {
    let testResult = null;
    let planObjectName = planObjects[i];
    console.log(planObjectName);
    if (planObjectName.indexOf(test.name) === 0) {
      let obj = plan[planObjectName];
      let objAction = getObjectAction(obj, test);
      switch (objAction) {
        case "create":
          break;
        case "upgrade":
          if (test.allow_change === false) testResult = false;
          break;
        case "destroy_recreate":
          if (!test.changeWindow && test.allow_destroy === false) testResult = false;
          else {
            const now = (new Date()).getTime();
            const fromTs = (new Date(test.changeWindow.from)).getTime();
            const toTs = (new Date(test.changeWindow.to)).getTime();
            if (!(now > fromTs && now < toTs) && test.allow_destroy === false) testResult = false;
          }
          break;
        case "destroy":
          if (test.allow_destroy === false) testResult = false;
          break;
        default:
          testResult = false;
          console.error("Failed to parse object action: ", objAction);
          break;
      } // end switch objAction
      if (testResult === null) {
        if (test.tests[objAction]) {
          let customTest = test.tests[objAction];
          let customTestResult = await customTest(obj, args);
          if (!customTestResult) testResult = false;
        }
      }
      if (testResult === null) testResult = true;
      testResults.push(testResult);
    } // end test on name of object
  } // end for
  if (testResults.length === 0) {
    resolve(true);
  } else {
    let result = testResults.reduce((item) => item);
    if (result.length === testResults.length) resolve(true);
    else resolve(false);
  }
});



const runTests = (tsFile, plan, modulePath) => new Promise (async (resolve, reject) => {
  let tests = null;
  try {
    tests = require(tsFile);
  } catch (e) {
    console.error('Failed to parse test file.')
  }
  let results = [];
  const looper = async (ts) => {
    if (ts.length === 0) {
      resolve(results);
    } else {
      let test = ts.shift();
      if (test['module']) {
        let childResults = await runTests(path.join(modulePath, test.module + '.js'), plan, modulePath);
        results = results.concat(childResults);
        looper(ts);
      } else {
        let result = await runATest(test, plan, test.args||{});
        results.push({ test: test, result: result });
        looper(ts);
      }
    }
  };
  looper(tests.slice(0));
});


module.exports = runTests;
