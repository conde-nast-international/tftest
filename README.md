# tftest

## Creating a (simple) test

For example, a test on `cnid-infrastructure/src/account_453746000463/services/eu-central-1/polaroid-mongo-replica-set` would be created in the following way
Firstly `cnid-terrraform-modules/mongo-replica-sets/tests.js` is created with the following content:-
```
module.exports = [
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
```
module.exports = [
  {
    "module": "mongo-replica-sets",
    "prefix": "mongo"
  }
];
```

## Creating a (complex) test
In order to ensure that for example a DNS record is set correctly for `cnid-infrastructure/src/account_453746000463/services/eu-central-1/copilot-redis` we would create a `tests.js` file with the following content:-
```
const hostnameCheck = (obj, args) => {
  const matches = (obj.name === args.hostname);
  return matches;
};

module.exports = [
  {
    "name": "aws_route53_record.dns",
    "create_arg_count": 11,
    "allow_create": true,
    "allow_destroy": false,
    "args": {
      "hostname": "copilot-redis-staging.eu-central-1.cni.digital"
    },
    "tests": {
      "create": hostnameCheck,
      "update": hostnameCheck
    }
  }
];
```

This will ensure that if the record is created or updated, it will have to have the correct hostname.

## How test are executed

For example, a test on `cnid-infrastructure/src/account_453746000463/services/eu-central-1/polaroid-mongo-replica-set` would execute in the following manner.
- `terraform init`
- `terraform plan -out=/tmp/plan.out`
- tftest
- - `tftest test /tmp/plan.out`
- - tftest now looks for `tests.js` in the current working directory to discover modules that are being used, and their "prefix"
- - tftest will now examine `.terraform/modules/modules.json` to detect any modules that contain a `tests.js` file.
- - tftest executes the tests against the plan file, if any tests fail the return code is non-zero.
