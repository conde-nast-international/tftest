# tftest

## Creating a test

For example, a test on cnid-infrastructure/scr/account_123/services/eu-central-1/polaroid-mongodb would be created in the following way
Firstly `cnid-terrraform-modules/mongo-replica-sets/tests.js` is created with the following content:-
```module.exports = [
  {
    "name": "aws_launch_configuration.mongo",
    "allow_destroy": false,
    "allow_change": false
  }
];
```
This will ensure that plans that contain requests to destroy or change the launch config will cause tests to fail.
We then create a tests.js in the location where this is utilised, eg: `cnid-infrastructure/src/account_453746000463/services/eu-central-1/polaroid-mongo-replica-set/tests.js`
With the following content:
```module.exports = [
  {
    "module": "mongo-replica-sets",
    "prefix": "mongo"
  }
];
```

## How test are executed

For example, a test on cnid-infrastructure/src/account_123/services/eu-central-1/polaroid-mongodb would execute in the following manner.
- terraform init
- terraform plan -out=/tmp/plan.out
- tftest
- - tftest test /tmp/plan.out
- - tftest now looks for tests.js in the current working directory to discover modules that are being used, and their "prefix"
- - tftest will now examine .terraform/modules to detect any modules that contain a `tests.js` file.
- - tftest executes the tests against the plan file, if any tests fail the return code is non-zero.
